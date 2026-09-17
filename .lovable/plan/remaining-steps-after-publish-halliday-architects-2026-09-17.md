# Remaining steps after publish — Halliday Architects

Verified live state: the published site redirects to ha.stagehomy.com, but it still serves the **old static sitemap** — the recent work (dynamic sitemap, maintenance mode, single admin gate) went in after the publish. Crawlers remain blocked on purpose until the real-domain launch.

## Point 1 — Update the published site (user action, 1 click)

Frontend changes go live only via **Publish → Update**. Until then the live site runs the pre-migration build.
After updating, verify:
- `ha.stagehomy.com/sitemap.xml` is generated live and lists real project and blog URLs
- `ha.stagehomy.com/` title and meta come from the new route heads

## Point 2 — Delete the old sitemap edge function

Once the updated publish is confirmed serving the dynamic sitemap, delete the deployed `sitemap` edge function (kept until now as rollback cover). Source is already removed from the repo.

## Point 3 — Move remaining edge functions to server code

Standard for new work: `createServerFn` / `api/public/*`, not edge functions.
- `manage-users` (invites, role edits) → authenticated server functions
- `notify-inquiry` (contact form email) → `api/public/*` route with constant-time shared-secret check
- Verify one full invite cycle and one contact-form submission after the move

## Point 4 — Users page: last sign-in + automatic developer role

- Add a "Last sign in" column to the admin Users page
- Auto-grant `developer` to `rutkusmarius@gmail.com` on signup (database trigger), so the role does not depend on the invite path

## Point 5 — Small standard fixes (low priority, one batch)

- `ImagePicker.tsx` hardcoded colour utilities → semantic tokens
- JSON-LD: generate from `site_settings`, add `Organization`, `BreadcrumbList`, and `Article` on blog posts
- Align role helper names to `is_developer` / `is_manager` / `is_admin_staff`

## Point 6 — Lighthouse check

Run Lighthouse on the published site; target SEO and Accessibility 95+. Fix what it flags.

## Point 7 — Go-live checklist (only when moving to hallidayarchitects.com)

Already written in `GO-LIVE.md`. Not for now — the site stays hidden from search engines while on the temporary domain:
- Lift `noindex` + unblock `robots.txt` in one commit, point sitemap to the real domain
- Connect hallidayarchitects.com (+ www), set `APP_BASE_URL`, submit sitemap to Google Search Console
- Retire ha.stagehomy.com and its DNS records

## Order

Points 1–2 first (publish hygiene), then 3–4 (backend standard), then 5–6 (polish + measurement). Point 7 waits for the real domain decision.
