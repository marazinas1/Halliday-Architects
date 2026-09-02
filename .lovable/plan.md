# Role rename, simpler resolver, better picker, sharper photography

Four steps, done in this order.

## Step 1 — Rename `platform_owner` to `developer`

Isolated, small, first, so everything after it is written against the correct value.

- Migration: add `developer` to the `app_role` enum, `UPDATE public.user_roles SET role = 'developer' WHERE role = 'platform_owner'`, then rewrite the bodies of `is_platform_owner()`, `is_admin()`, `is_owner()`, `is_staff()` and `guard_user_roles()` to compare against `'developer'`. Function names stay as they are.
- Code: `AdminRole` type and `STAFF_ROLES` / `isOwnerRole` in `useAdminAuth`, the `ROLE_LABEL` entries in `AdminSidebar` and `AdminUsers`, the role check in the `manage-users` edge function, and the label in the admin invite email template.
- Verification: sign in, confirm the sidebar still shows "Developer", the Users screen still lists everyone, and a role change on a non-developer account still succeeds.

## Step 2 — Simplify the automatic-photograph resolver

No new screen, no new table.

- `useResolvedPageImages` drops `HOME_PRIORITY_SLUGS` entirely and takes published projects in `sort_order` — the same order the Projects list already shows and the client already controls by reordering.
- Homepage wall and tiles consume the first N published projects in that order; the About strip keeps taking the last two; each Services band takes one project by index.
- Remove the hero dependency: `site_settings.hero_image_bucket`, `hero_image_path`, `hero_headline` and `hero_subline` are V1 leftovers that currently jump the queue into `wall_1`. Drop them from the resolver, from `useSiteSettings`, from the admin settings/home screens that still write them, and from the columns once nothing reads them. One source per photograph.
- Verification: reorder a project in the admin list and confirm the homepage wall order follows it.

## Step 3 — Picker and photograph library

**Picker.** Give the dialog a proper height and a wider max width. Replace the thin scrolling tab strip with a visible project list — a left column on desktop (name + photograph count), a full-width select on narrow screens. The search field filters that list. Selected project name and count stay above the grid, which scrolls on its own.

**Photograph library.** New admin screen, Website → Photographs: everything uploaded through a picker (the `site-images` bucket), listed with thumbnail, upload date and which slots use it, with delete for unused files. The picker gains a third tab, "Uploaded", so a standalone photograph can be reused instead of uploaded twice.

## Step 4 — Photograph quality

**First, verify what the plan supports.** Before building anything, request a transformed URL (`/render/image/public/...?width=800`) against a real object and read the response. Only if it returns a resized image do we use five variants; if it 4xx's, we fall back to generating two sizes at upload time (full + 1400px) and using those in the `srcset`.

Presets raised:

| Preset | Now | Proposed |
|---|---|---|
| Project photography | 2400px, q0.82, ~1MB | 3000px, q0.86, ~1.6MB |
| Homepage hero / full-bleed | 2560px, q0.82, ~1.2MB | 3200px, q0.88, ~2.2MB |
| Blog cover | 1800px, q0.82 | 2000px, q0.86 |
| Headshots, body, logos | unchanged | unchanged |

Paired with a shared `ResponsiveImage` component: `srcset` + `sizes`, explicit `width`/`height`, `fetchpriority="high"` and a preload on the single hero image, lazy loading everywhere below the fold.

**Standard to hold:** LCP under 2.5s on a mid-range phone, hero under ~400KB over the wire after variant selection, full homepage under ~2MB.

**Verification is a real measurement, not a claim:** load the homepage in a headless browser at a mobile viewport and at 1440px, capture every image request with its transferred size, and report the totals plus the measured LCP. If a target is missed, the step is not done.

Existing photographs stay at their current encoding — they were compressed at the old settings. Re-doing them means re-uploading from the originals; say the word and I will script that as a separate pass.

## Technical notes

- Step 1 is its own migration; nothing else ships with it.
- Step 2 touches `useResolvedPageImages`, `useSiteSettings`, `AdminHome`, `AdminSettings`, and a follow-up migration dropping the four `site_settings` hero columns.
- Step 3 touches `ImagePicker`, `PageImageSlot` dialog sizing, a new `useSiteImageLibrary` hook and a new admin route.
- Step 4 touches `IMAGE_PRESETS`, a new `ResponsiveImage`, and its adoption on Home, Projects, About, Services and Blog.
