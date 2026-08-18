# Central branding, admin settings, sidebar shell, branded login

## Part 1 — site_settings as the single branding source

Migration (structure only, no data):

- `site_settings`: `id` (uuid pk), single-row guard (unique constant column), `site_name` text, `logo_path`, `logo_dark_path`, `favicon_path`, `og_image_path` (all nullable text storage paths), `updated_at` with the existing trigger.
- GRANTs + RLS mirroring `team_members`: `anon` and `authenticated` can read; only `is_admin()` can insert/update/delete.
- New public storage bucket `brand-assets`: public read, admin-only write/update/delete policies on `storage.objects`.

Client side:

- `src/lib/admin/uploadBrandAsset.ts` — optimise + upload + delete helpers, same shape as `uploadTeamPhoto.ts`, returning storage paths.
- `src/hooks/useSiteSettings.ts` — TanStack Query hook returning resolved public URLs plus `site_name`. When no row or no upload exists it falls back to the bundled `src/assets/halliday-logo.png` and the firm name from `src/content/firm.ts`, so the mark never disappears.
- `src/components/BrandLogo.tsx` — small component taking `variant="light" | "dark"`, reading the hook, rendering the right URL with the current sizing/alt behaviour.

Replace the static import in `GlobalNav.tsx`, `GlobalFooter.tsx` and the admin shell with `BrandLogo`. The footer keeps its current dark treatment: it uses `logo_dark_url` when uploaded, otherwise the existing brightness/invert filter on the fallback.

Favicon and OG image: when `favicon_path` / `og_image_path` are set, a small effect updates the `<link rel="icon">` href and `og:image` meta at runtime. The static tags in `index.html` remain as the default.

## Part 2 — Admin Settings

New route `/admin/settings` with `AdminSettings.tsx`:

- Site name text field.
- Four upload slots: logo, dark logo, favicon, OG image — each with current preview, replace and remove. Replacing deletes the previous storage object, so no orphans.
- Uploads go through the existing pipeline with a new `logo` preset in `src/lib/images/optimizeImage.ts`: PNG output (not WebP), transparency preserved, max 800px long edge, minimal compression. A separate `favicon` preset outputs a 256px square PNG. The OG image uses the existing `cover` preset.
- Live preview panel showing the logo on paper and on ink side by side, so the correct variant is obvious.
- Saving writes to the single `site_settings` row (upsert) and invalidates the query, so the change appears immediately everywhere.

## Part 3 — Admin sidebar shell

`AdminShell.tsx` is rebuilt on the shadcn sidebar (`SidebarProvider`, `Sidebar collapsible="icon"`):

- Top: logo from `site_settings`.
- Nav: Projects, Team, Settings — active state from the current route. Blog and Inquiries appear as disabled items marked "Coming soon", so the structure is visible without pretending they work.
- Bottom: signed-in email and sign-out.
- A `SidebarTrigger` lives in a thin top bar so the sidebar can always be reopened; on mobile it opens as an overlay.

## Part 4 — Branded login split

`AdminLogin.tsx` becomes a two-column layout:

- Left (or top on mobile): the existing email/password form, restyled into a quiet card. No provider buttons — there is no Google option in the current code and none will be added.
- Right: a solid ink panel with the dark logo centred, generously spaced, plus the site name in small caps. Hidden below `md` where the form takes the full width.
- Reusable pieces live in `src/components/brand/AuthSplit.tsx` and `AuthCard.tsx`, patterned on the reference build but with no translation layer.

## Verification

- Upload a new logo in Settings and confirm it changes on the homepage nav, the footer, the admin sidebar and the login panel with no code change.
- Clear the uploads and confirm the bundled fallback renders in all four places.
- Sidebar and login checked at 1280px and 390px.
- Deleting/replacing an asset removes the old file from the bucket.

## Technical notes

- New files: migration, `uploadBrandAsset.ts`, `useSiteSettings.ts`, `BrandLogo.tsx`, `AdminSettings.tsx`, `components/brand/AuthSplit.tsx`, `AuthCard.tsx`.
- Edited: `optimizeImage.ts` (logo/favicon presets), `AdminShell.tsx`, `AdminLogin.tsx`, `GlobalNav.tsx`, `GlobalFooter.tsx`, `App.tsx` (new `/admin/settings` route).
- English only; no i18n layer introduced.
