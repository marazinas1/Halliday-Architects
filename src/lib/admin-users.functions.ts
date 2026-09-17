// Account administration for owners — ported from the manage-users edge
// function. Every function re-validates the caller's role server-side;
// nothing here trusts a role sent by the client.
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ManageableRole = z.enum(["owner", "editor"]);
type ManageableRole = z.infer<typeof ManageableRole>;

/** The maintainer account is always granted the developer role, whatever was requested. */
const PLATFORM_OWNER_EMAIL = "rutkusmarius@gmail.com";

const APP_BASE_URL_FALLBACK = "https://ha.stagehomy.com";

/**
 * Email links must be absolute. The Origin header is raw request input and can
 * be missing entirely, so it is parsed rather than trusted, and a configured
 * APP_BASE_URL (or a hard fallback) covers the case where it is absent.
 */
function appLink(path: string, requestedOrigin?: string | null): string {
  let base = APP_BASE_URL_FALLBACK;
  const fromEnv = process.env["APP_BASE_URL"];
  if (fromEnv) {
    try {
      base = new URL(fromEnv).origin;
    } catch {
      /* ignore */
    }
  }
  if (requestedOrigin) {
    try {
      base = new URL(requestedOrigin).origin;
    } catch {
      /* ignore */
    }
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Random password that satisfies any reasonable policy. */
function tempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return "Ha" + btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, "") + "9!";
}

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

type CallerContext = {
  callerId: string;
  isPlatformOwner: boolean;
  admin: Admin;
};

/**
 * Shared gate: caller must be authenticated (middleware) and hold owner or
 * developer. Returns the privileged client only after the check passes.
 */
async function requireOwner(supabase: unknown, userId: string): Promise<CallerContext> {
  const client = supabase as {
    rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown }>;
  };
  const [{ data: isPlatformOwner }, { data: isOwnerRole }] = await Promise.all([
    client.rpc("is_platform_owner", { _user_id: userId }),
    client.rpc("is_owner", { _user_id: userId }),
  ]);
  if (!isPlatformOwner && !isOwnerRole) {
    throw new Error("Only owners can manage users.");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { callerId: userId, isPlatformOwner: Boolean(isPlatformOwner), admin: supabaseAdmin };
}

type RoleRow = { user_id: string; role: string };

async function loadRoles(admin: Admin) {
  const { data } = await admin.from("user_roles").select("user_id, role");
  const rows = (data ?? []) as RoleRow[];
  const roleByUser = new Map<string, string>();
  for (const row of rows) roleByUser.set(row.user_id, row.role);
  const developerIds = new Set(rows.filter((r) => r.role === "developer").map((r) => r.user_id));
  const ownerIds = rows.filter((r) => r.role === "owner").map((r) => r.user_id);
  return { roleByUser, developerIds, ownerIds };
}

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { admin, roleByUser, developerIds, ownerIds } = await (async () => {
      const ctx = await requireOwner(context.supabase, context.userId);
      return { admin: ctx.admin, ...(await loadRoles(ctx.admin)) };
    })();

    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    const users = data.users
      .map((u) => ({
        id: u.id,
        email: u.email ?? "",
        role: roleByUser.get(u.id) ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        confirmed: Boolean(u.email_confirmed_at),
        isPlatformOwner: developerIds.has(u.id),
        isLastOwner: roleByUser.get(u.id) === "owner" && ownerIds.length <= 1,
      }))
      .sort((a, b) => a.email.localeCompare(b.email));
    return { users };
  });

export const inviteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; role: ManageableRole }) =>
    z.object({ email: z.string().email().max(320), role: ManageableRole }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = await requireOwner(context.supabase, context.userId);
    const { admin, roleByUser } = { admin: ctx.admin, ...(await loadRoles(ctx.admin)) };

    const email = data.email.trim().toLowerCase();
    const redirectTo = appLink("/admin/set-password", getRequestHeader("origin"));

    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const alreadyThere = existing.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (alreadyThere) {
      // Someone invited but never finished setting a password would otherwise be
      // stuck forever. Send a recovery link instead; the role stays untouched.
      const link = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });
      if (link.error) throw new Error(link.error.message);
      const actionLink = link.data?.properties?.action_link ?? null;

      const { sendAdminInviteEmail } = await import("@/lib/email/send.server");
      const emailSent = actionLink
        ? await sendAdminInviteEmail(email, {
            role: roleByUser.get(alreadyThere.id) ?? null,
            actionLink,
            userId: alreadyThere.id,
          })
        : false;

      return {
        success: true,
        userId: alreadyThere.id,
        emailSent,
        password: null as string | null,
        actionLink,
        reinvited: true,
      };
    }

    let userId: string | null = null;
    let emailSent = false;
    let password: string | null = null;
    let actionLink: string | null = null;

    // Preferred path: a real invitation email.
    const invited = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (!invited.error && invited.data.user) {
      userId = invited.data.user.id;
      emailSent = true;
    } else {
      // Sending domain not verified yet — create the account directly so the
      // owner can hand over credentials themselves.
      password = tempPassword();
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (created.error || !created.data.user) {
        throw new Error(created.error?.message ?? "Could not create the account.");
      }
      userId = created.data.user.id;
      const link = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });
      actionLink = link.data?.properties?.action_link ?? null;
    }

    // The maintainer address always gets the developer role, whatever the
    // inviter picked. The role is written after the account exists, so nothing
    // depends on trigger ordering; a failure must not leave a roleless account.
    const grantedRole = email === PLATFORM_OWNER_EMAIL ? "developer" : data.role;
    const { error: roleError } = await admin
      .from("user_roles")
      .upsert({ user_id: userId, role: grantedRole }, { onConflict: "user_id,role" });
    if (roleError) {
      await admin.auth.admin.deleteUser(userId);
      throw new Error(roleError.message);
    }

    return { success: true, userId, emailSent, password, actionLink, reinvited: false };
  });

/**
 * Shared guards for the mutating actions below: no self-service lockout,
 * developer rows are shielded from non-developers, and the site must never
 * be left without an owner.
 */
async function guardTarget(
  ctx: CallerContext,
  targetUserId: string,
): Promise<Awaited<ReturnType<typeof loadRoles>>> {
  if (targetUserId === ctx.callerId) {
    throw new Error("You cannot change your own access.");
  }
  const roles = await loadRoles(ctx.admin);
  if (roles.developerIds.has(targetUserId) && !ctx.isPlatformOwner) {
    throw new Error("This account is managed by the developer.");
  }
  return roles;
}

const wouldRemoveLastOwner = (
  roles: Awaited<ReturnType<typeof loadRoles>>,
  ctx: CallerContext,
  userId: string,
) => !ctx.isPlatformOwner && roles.roleByUser.get(userId) === "owner" && roles.ownerIds.length <= 1;

export const setAdminUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: ManageableRole }) =>
    z.object({ userId: z.string().uuid(), role: ManageableRole }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = await requireOwner(context.supabase, context.userId);
    const roles = await guardTarget(ctx, data.userId);
    if (data.role !== "owner" && wouldRemoveLastOwner(roles, ctx, data.userId)) {
      throw new Error("At least one owner account must remain.");
    }
    const { error: delError } = await ctx.admin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    if (delError) throw new Error(delError.message);
    const { error } = await ctx.admin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const revokeAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = await requireOwner(context.supabase, context.userId);
    const roles = await guardTarget(ctx, data.userId);
    if (wouldRemoveLastOwner(roles, ctx, data.userId)) {
      throw new Error("At least one owner account must remain.");
    }
    const { error } = await ctx.admin.from("user_roles").delete().eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/** Irreversible. Deliberately separate from revoking access. */
export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const ctx = await requireOwner(context.supabase, context.userId);
    const roles = await guardTarget(ctx, data.userId);
    if (wouldRemoveLastOwner(roles, ctx, data.userId)) {
      throw new Error("At least one owner account must remain.");
    }
    const { error: roleDelError } = await ctx.admin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    if (roleDelError) throw new Error(roleDelError.message);
    const { error } = await ctx.admin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
