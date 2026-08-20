import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'

// Account administration for owners. Every call re-validates the caller's JWT
// and their role server-side; nothing here trusts a role sent by the client.

const ManageableRole = z.enum(['owner', 'editor'])

const BodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('list') }),
  z.object({
    action: z.literal('invite'),
    email: z.string().email().max(320),
    role: ManageableRole,
  }),
  z.object({
    action: z.literal('set_role'),
    userId: z.string().uuid(),
    role: ManageableRole,
  }),
  z.object({ action: z.literal('revoke'), userId: z.string().uuid() }),
  z.object({ action: z.literal('delete_user'), userId: z.string().uuid() }),
])

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

/** Random password that satisfies any reasonable policy. */
function tempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return 'Ha' + btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, '') + '9!'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Not authenticated' }, 401)

  // Separate clients: one carries the user JWT, one carries service identity.
  const asCaller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  const { data: userData, error: userError } = await asCaller.auth.getUser()
  if (userError || !userData.user) return json({ error: 'Not authenticated' }, 401)
  const callerId = userData.user.id

  const { data: callerRoles } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', callerId)
  const roles = (callerRoles ?? []).map((r: { role: string }) => r.role)
  const isPlatformOwner = roles.includes('platform_owner')
  const isOwner = isPlatformOwner || roles.includes('owner')
  if (!isOwner) return json({ error: 'Only owners can manage users.' }, 403)

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400)
  const body = parsed.data

  // Role rows for everyone, used both for listing and for guard checks.
  const { data: allRoles } = await admin.from('user_roles').select('user_id, role')
  const roleByUser = new Map<string, string>()
  for (const row of allRoles ?? []) roleByUser.set(row.user_id, row.role)
  const platformOwnerIds = new Set(
    (allRoles ?? []).filter((r) => r.role === 'platform_owner').map((r) => r.user_id),
  )
  const ownerIds = (allRoles ?? []).filter((r) => r.role === 'owner').map((r) => r.user_id)

  /** Platform owner records are invisible and untouchable to everyone else. */
  const shielded = (userId: string) => platformOwnerIds.has(userId) && !isPlatformOwner

  /** Refuses any change that would leave the site without an owner account. */
  const wouldRemoveLastOwner = (userId: string) =>
    roleByUser.get(userId) === 'owner' && ownerIds.length <= 1

  if (body.action === 'list') {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) return json({ error: error.message }, 500)
    const users = data.users
      .filter((u) => !shielded(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? '',
        role: roleByUser.get(u.id) ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        confirmed: Boolean(u.email_confirmed_at),
        isPlatformOwner: platformOwnerIds.has(u.id),
        isLastOwner: roleByUser.get(u.id) === 'owner' && ownerIds.length <= 1,
      }))
      .sort((a, b) => a.email.localeCompare(b.email))
    return json({ users })
  }

  if (body.action === 'invite') {
    const email = body.email.trim().toLowerCase()

    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (existing.users.some((u) => (u.email ?? '').toLowerCase() === email)) {
      return json({ error: 'An account with this email already exists.' }, 409)
    }

    let userId: string | null = null
    let emailSent = false
    let password: string | null = null
    let actionLink: string | null = null

    // Preferred path: a real invitation email.
    const invited = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${req.headers.get('origin') ?? ''}/admin/login`,
    })
    if (!invited.error && invited.data.user) {
      userId = invited.data.user.id
      emailSent = true
    } else {
      // Sending domain not verified yet — create the account directly so the
      // owner can hand over credentials themselves.
      password = tempPassword()
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (created.error || !created.data.user) {
        return json({ error: created.error?.message ?? 'Could not create the account.' }, 500)
      }
      userId = created.data.user.id
      const link = await admin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: `${req.headers.get('origin') ?? ''}/admin/login` },
      })
      actionLink = link.data?.properties?.action_link ?? null
    }

    // The role is written after the account exists, so nothing depends on
    // trigger ordering. A failure here must not leave a roleless account.
    const { error: roleError } = await admin
      .from('user_roles')
      .insert({ user_id: userId, role: body.role })
    if (roleError) {
      await admin.auth.admin.deleteUser(userId)
      return json({ error: roleError.message }, 400)
    }

    return json({ success: true, userId, emailSent, password, actionLink })
  }

  if (shielded(body.userId)) return json({ error: 'Account not found.' }, 404)
  if (platformOwnerIds.has(body.userId) && !isPlatformOwner) {
    return json({ error: 'Platform owner accounts cannot be changed.' }, 403)
  }

  if (body.action === 'set_role') {
    if (body.role !== 'owner' && wouldRemoveLastOwner(body.userId)) {
      return json({ error: 'At least one owner account must remain.' }, 409)
    }
    const { error: delError } = await admin.from('user_roles').delete().eq('user_id', body.userId)
    if (delError) return json({ error: delError.message }, 400)
    const { error } = await admin
      .from('user_roles')
      .insert({ user_id: body.userId, role: body.role })
    if (error) return json({ error: error.message }, 400)
    return json({ success: true })
  }

  if (body.action === 'revoke') {
    if (wouldRemoveLastOwner(body.userId)) {
      return json({ error: 'At least one owner account must remain.' }, 409)
    }
    const { error } = await admin.from('user_roles').delete().eq('user_id', body.userId)
    if (error) return json({ error: error.message }, 400)
    return json({ success: true })
  }

  // delete_user — irreversible, and never the default meaning of "remove access".
  if (wouldRemoveLastOwner(body.userId)) {
    return json({ error: 'At least one owner account must remain.' }, 409)
  }
  if (body.userId === callerId) {
    return json({ error: 'You cannot delete your own account.' }, 409)
  }
  const { error: roleDelError } = await admin.from('user_roles').delete().eq('user_id', body.userId)
  if (roleDelError) return json({ error: roleDelError.message }, 400)
  const { error } = await admin.auth.admin.deleteUser(body.userId)
  if (error) return json({ error: error.message }, 500)
  return json({ success: true })
})
