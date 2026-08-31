# Email domain setup — deferred until domain move

## Decision

Email sender domain setup is **deferred** until the site moves from the temporary
subdomain `ha.stagehomy.com` to the permanent domain `hallidayarchitects.com`.

## Why wait

- The invitation/password-recovery **link-based flow works now without email
  delivery**: "Resend invitation" generates a set-password link that can be handed
  over manually, and the full set-password / recovery journey works from that link.
- Email delivery to inboxes is a **production concern** (real invited users
  receiving the invitation email), not needed for dev/client review on the temp
  noindex domain.
- Setting up now on `stagehomy.com` would mean **double configuration** later —
  no benefit since the link flow already covers testing.
- Setting up now on `hallidayarchitects.com` would require asking Chris for DNS
  access mid-build — added friction for no production value.

## At go-live (when moving to hallidayarchitects.com)

In the same coordination with Chris where DNS records for the domain move are
added, also:

1. Ask Chris to add the **NS delegation records** for the email subdomain
   (e.g. `notify.hallidayarchitects.com` → Lovable nameservers). The exact records
   are shown in Cloud → Emails → Set up / Manage Domains at that time — do not
   quote them from memory.
2. Complete the email domain setup dialog in this project.
3. Scaffold the **auth email templates** and deploy `auth-email-hook`.
4. Wire the configured sender domain into the existing `manage-users`
   invitation email code (it already calls the send helper; it just needs the
   verified domain so sends stop returning `no_matching_sender`).
5. Verify a "Resend invitation" sends both the generated link **and** a
   delivered email end-to-end.

## Current state

- `manage-users` Edge Function already generates set-password links and calls
  the email send helper. It falls back to "send it manually" only because no
  sender domain is configured yet — no code change needed until the domain exists.
- Auth emails use Lovable default templates until custom ones are scaffolded.
