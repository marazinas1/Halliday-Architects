# Deerva standards audit — Halliday Architects

Full review against the seven active Deerva standards. Everything below was verified against the live code and database, not assumed.

## What already meets the standard

- TanStack Start v1 + React 19 + Vite 8 + Tailwind v4 CSS-first, no `tailwind.config.js`.
- Every public page is server-rendered with its own `head()` (title, description, OG, Twitter, canonical).
- Image pipeline is exemplary: one optimized WebP master per upload, per-slot responsive delivery, old files deleted on replace.
- Three-tier content resolution (client choice → developer default → automatic) with a single **Default** badge.
- `user_roles` is a separate table, checks go through security-definer functions, and a `BEFORE` trigger protects developer rows.
- `updated_at` triggers on every content table.
- Temporary `noindex` plus a crawler-blocking `robots.txt`, with the removal note in place.

## Gaps, by priority

### A. High — required by the standard, currently missing

1. **Deerva footer badge is absent.** No "Platform developed and maintained by Deerva" line anywhere. The standard requires it on every platform, linking to deerva.com with `utm_source=hallidayarchitects.com&utm_medium=referral&utm_campaign=platform-badge`, in a quiet muted style.
2. **Business contacts are hardcoded.** Address, phone, fax and email live in `src/content/firm.ts` and again inside the JSON-LD block in the root route. The standard says these belong in `site_settings` and are read everywhere (footer, contact page, map, schema). `site_settings` currently has no address/phone/email/social columns.
3. **Google font loaded via `@import` in `src/styles.css`.** Explicitly forbidden — it must be a `<link>` in the root route head (it already has the preconnects).
4. **Analytics collection does not meet the standard.** Today a view fires immediately on route change. Missing: session id in `sessionStorage`, the engagement gate (5s or scroll/click/key), visit duration on exit, logged-in staff exclusion, UTM capture, and the 14-month row cleanup. `page_views` has no session, duration or UTM columns.
5. **Testimonials are unreachable in the admin.** The page exists but has no sidebar entry, so the client cannot find it.

### B. Medium — structural drift worth correcting

6. **Admin sidebar grouping differs from the fixed order.** Standard is WORKSPACE (Dashboard, Inquiries, Analytics) → MANAGE (Projects, Articles, Testimonials) → SETTINGS (Users, Settings). Today Users sits in Workspace, and "The website" mixes repeating entities (Projects, Blog) with per-page content editors.
7. **No maintenance mode.** No flag in `site_settings`, no visitor holding page, no staff banner. Standard requires it, defaulting to hidden until auth resolves.
8. **Admin auth gate is per-page, client-side.** `AdminProtected` wraps each page instead of a single `src/routes/_authenticated/` route gate.
9. **Three edge functions remain** (`manage-users`, `notify-inquiry`, `sitemap`). The standard exempts only OCDG and StageHomy; here they should become `createServerFn` plus `api/public/*` routes. Note there are currently no server functions in the project at all.
10. **Sitemap is a static file** pointing at `halliday-architects.lovable.app`. It must be generated from real routes and published rows, on the real domain.
11. **Users page has no last-sign-in column**, and no automatic `developer` role grant for `rutkusmarius@gmail.com` on signup — the role is only applied through the invite function today.
12. **`FRONTEND.md` is missing** (`AGENTS.md` and `PLAN.md` exist).

### C. Low — polish

13. **Role helper names drift**: `is_platform_owner` / `is_owner` / `is_staff` versus the standard `is_developer` / `is_manager` / `is_admin_staff`.
14. **Hardcoded colour utilities** in `src/components/admin/ImagePicker.tsx` (shadcn primitives are vendor files and can stay).
15. **JSON-LD is minimal**: `ArchitecturalService` only, hardcoded, on the root route. Add `Organization`, `BreadcrumbList`, and `Article` on blog posts, all generated from `site_settings`.
16. **Custom token names** (`ink`, `paper`, `stone`, `line`) are used directly across components alongside the semantic set. Standard wants components on semantic names so a remix is a one-file repaint.

## Suggested order of work

1. Deerva badge + font `<link>` + FRONTEND.md — small, same session.
2. `site_settings` contact columns, admin Business tab, and every consumer (footer, contact, map, JSON-LD) reading from them.
3. Analytics rebuild to the standard (session, engagement gate, duration, UTM, staff exclusion, purge) plus the analytics page metrics it unlocks.
4. Admin structure: sidebar regrouping, Testimonials entry, maintenance mode.
5. Routing and server code: `_authenticated/` gate, edge functions → server functions, generated sitemap.
6. Launch checklist items at go-live: lift `noindex` and robots together, real domain in sitemap and OG images, Lighthouse SEO/Accessibility 95+.

## Technical notes

- `site_settings` additions: `address_line1`, `address_line2`, `mailing_line1`, `mailing_line2`, `phone`, `fax`, `email`, `instagram_url` — one migration with GRANT, RLS and policies; no client data in it, values entered through the admin.
- `page_views` additions: `session_id`, `duration_seconds`, `utm_source`, `utm_medium`, `utm_campaign`; the beacon in `usePageTracking.ts` becomes two pings (engaged view, then duration on `visibilitychange`).
- Nothing in this audit touches the image pipeline or the 1–2–3–2 gallery rhythm — both already match the standard.
