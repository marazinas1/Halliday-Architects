import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ManagedRole = "owner" | "editor";

export type ManagedUser = {
  id: string;
  email: string;
  role: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
  isPlatformOwner: boolean;
  isLastOwner: boolean;
};

export type InviteResult = {
  userId: string;
  emailSent: boolean;
  password: string | null;
  actionLink: string | null;
  /** True when the address already existed and a recovery link was sent instead. */
  reinvited?: boolean;
};

export const ADMIN_USERS_KEY = ["admin", "users"];

/** Every call runs through the `manage-users` function, which re-checks the caller's role. */
async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("manage-users", { body });
  if (error) {
    // Edge function errors carry the useful message in the response body.
    const message = await (error as { context?: Response }).context
      ?.clone()
      .json()
      .then((b) => b?.error)
      .catch(() => null);
    throw new Error(typeof message === "string" ? message : error.message);
  }
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data as T;
}

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: ADMIN_USERS_KEY,
    enabled,
    queryFn: async () => {
      const data = await call<{ users: ManagedUser[] }>({ action: "list" });
      return data.users;
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: ManagedRole }) =>
      call<InviteResult>({ action: "invite", ...input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; role: ManagedRole }) =>
      call({ action: "set_role", ...input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useRevokeAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => call({ action: "revoke", userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

/** Irreversible. Deliberately separate from revoking access. */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => call({ action: "delete_user", userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}
