# Inquiries: admin inbox + email notification

Contact form submissions land in the database but nothing shows them. This adds a real inbox in the admin, an email alert on every new enquiry, and hardens the public form.

## What I confirmed first

- `leads` has: name, email, phone, interest, message, source, user_agent, created_at. It has **no** read state, **no** archive flag, and **no** separate project type / timeline columns — the contact form merges those two into one `interest` string (e.g. "Renovation — In 3–6 months").
- `leads` RLS today allows anonymous insert and **service_role only** for select/update/delete. An admin signed into the panel currently cannot read a single enquiry.
- The email function `send-transactional-email` and the `inquiry-notification` template already exist and are invoked by the form, but the sender domain `notify.hallidayarchitects.com` is **not verified** in the workspace (only an unrelated domain is). So today the email silently fails.

## Part 1 — Admin inquiries at /admin/inquiries

Sidebar "Inquiries" stops being a placeholder and becomes a real link, with a badge showing the number of unread, unarchived enquiries.

The section shows a list, newest first: name, email, phone, project type, timeline, date, and read state. Unread rows are visually distinct (bolder text, a small marker). A search box filters by name or email; a filter switches between Unread / All / Archived.

Clicking a row opens a detail panel with the full message and the sender's email as a mailto link, plus a tel link for the phone. Opening marks it read automatically; a manual control toggles it back to unread. Archive moves it out of the default view — nothing is ever hard deleted, and archived enquiries stay reachable through the Archived filter.

## Part 2 — Email notification on insert

Every new enquiry triggers a plain notification email: who wrote in, their contact details, the message, and a direct link to that enquiry in the admin panel. It fires from the database on insert, so it does not depend on the browser finishing the request.

The recipient list becomes a setting the client can edit (comma-separated addresses, so it can go to both principals) rather than a hardcoded address.

Domain verification is an outstanding launch task and will be recorded in PLAN.md and the launch checklist: until `notify.hallidayarchitects.com` is verified, the function will build and log correctly but the mail will not deliver. The admin panel is the safety net in the meantime.

## Part 3 — Public form hardening

The form already blocks double submission via a disabled state during send and shows an error toast with phone/email fallback if the insert fails. This will be verified end to end and extended so the newly split fields are written, not just merged into one string.

## Technical detail

**Migration (structure only)**
- `leads`: add `read_at timestamptz`, `archived_at timestamptz`, `project_type text`, `timeline text`; index on `(archived_at, read_at, created_at desc)`.
- Grants: `GRANT SELECT, UPDATE ON public.leads TO authenticated;` (keep existing anon insert grant, keep service_role ALL).
- RLS: add admin policies `SELECT` and `UPDATE` using `is_admin()`. No admin `DELETE` policy — archive only.
- Notification recipients: add `inquiry_notify_emails text` to `site_settings` (comma-separated), default null → function falls back to `chris@hallidayarchitects.com`.

**Trigger → function**
- `AFTER INSERT ON public.leads` trigger runs a security-definer function that calls the edge function `notify-inquiry` asynchronously with `net.http_post` (pg_net), passing the lead id. Trigger failures are swallowed so a mail problem can never block a submission.
- New edge function `supabase/functions/notify-inquiry/index.ts`: validates the payload with Zod, loads the lead and the recipient list with the service role, renders the existing `inquiry-notification` template (extended with project type, timeline and an "Open in admin" link), and sends via `sendLovableEmail`. CORS headers imported from `npm:@supabase/supabase-js@2/cors`.
- The client-side `functions.invoke` in `ContactSection.tsx` is removed so the email is not sent twice.

**Frontend**
- `src/hooks/admin/useInquiries.ts` — list query (search, filter), unread-count query, and mutations for read/unread/archive/unarchive, all invalidating the count.
- `src/pages/admin/AdminInquiries.tsx` — list + detail (Sheet on desktop/mobile), matching the existing admin patterns (search bar, filter dropdown, table/list styling used by AdminProjects).
- `AdminSidebar.tsx` — move Inquiries into the main group with a count badge.
- `App.tsx` — register `/admin/inquiries`.
- `AdminSettings.tsx` — field for notification recipients.
- `ContactSection.tsx` — write `project_type` and `timeline` as their own columns (keep `interest` for the combined label), remove the direct email invoke.
- `PLAN.md` — mark inquiries done, add "verify notify.hallidayarchitects.com sending domain" to the launch checklist as blocking.

**Verification**
Submit the public form in the preview, confirm a row with every field populated, confirm it appears unread with the sidebar badge at 1, open it and confirm it flips to read, archive it and confirm it leaves the default list but survives under Archived, and check the edge function logs to confirm the trigger fired.
