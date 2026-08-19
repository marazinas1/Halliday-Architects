# Editable homepage

Give the client control of the homepage hero and intro, plus a simple way to choose which four projects appear, without turning the admin into a form wall.

## What changes for the client

- A new **Homepage** item in the admin sidebar: hero image chooser with preview, and four text fields (headline, subline, intro heading, intro body). Each field carries a one-line note saying where it appears.
- The hero image can be **picked from existing project photography** (a grid of published project images, searchable by project) or **uploaded** as a standalone photograph. Picking an existing image references it in place — no copy, no second file.
- A **Preview** button that opens the real homepage in a new tab from the unsaved form state, exactly like the project, blog and team forms already do.
- A **Featured** toggle on each project, in both the projects list and the project form, with a visible count ("3 of 4 featured") so it is obvious when too few or too many are marked.
- Any text field left empty falls back to the copy that is on the site today, so the homepage can never render blank.

## Homepage behaviour

- With a hero image set, the hero renders full-bleed photography with the headline and subline over it, using the same treatment as project heroes: image, dark-to-transparent scrim for legibility, white gradient fade at the bottom. With no image set, it keeps the current flat sand block.
- The homepage grid shows featured projects ordered by `sort_order`, capped at four. If fewer than four are featured, the remaining slots fill with the most recent published projects (no duplicates), so the grid is never partially empty. Projects-page ordering is untouched.

## Technical notes

**Migration**
- `site_settings`: add `hero_image_bucket text`, `hero_image_path text`, `hero_headline text`, `hero_subline text`, `intro_heading text`, `intro_body text` — all nullable, no defaults. `hero_image_bucket` is `'project-images'` for a picked photo and `'site-images'` for an uploaded one; it is what makes the reference unambiguous and the cleanup rule safe.
- `projects`: add `featured boolean not null default false`, plus a partial index on `(featured, sort_order)`.
- Existing RLS and grants on both tables already cover these columns; no policy changes needed.

**Storage and pipeline**
- New public `site-images` bucket for uploaded homepage photography, admin-write / public-read RLS matching the other buckets. `brand-assets` stays what it is: small, permanent brand marks.
- Uploads go to `site-images/homepage/<uuid>.webp` through a new `uploadSiteImage` helper on the shared pipeline, using a new `hero` preset in `src/lib/images/optimizeImage.ts`: 2560px longest edge, ~1.2MB target, quality 0.82, WebP.
- Picked project images are referenced as `('project-images', <existing storage_path>)`. Nothing is copied.
- **Deletion hazard:** the cleanup rule applies only when `hero_image_bucket = 'site-images'`. Replacing or clearing a picked project image changes the two columns and deletes nothing. Project deletion already wipes its own folder; if the hero pointed at one of those images, the homepage falls back to the sand block rather than a broken image, which the renderer handles by treating a failed/missing URL the same as no image.

**Code**
- `useSiteSettings`: extend `SiteSettingsRow` and the resolved settings object with the five fields plus a resolved `heroImageUrl`, applying the hardcoded fallbacks currently in `Index.tsx` (kept in one exported `HOMEPAGE_FALLBACKS` object). `useSaveSiteSettings` needs no change — its patch type derives from the row.
- New `src/pages/admin/AdminHomepage.tsx` at `/admin/homepage`, reusing the asset-slot and progress pattern from `AdminSettings.tsx`. Sidebar entry added above Settings.
- `src/lib/admin/preview.ts`: add a `"homepage"` preview kind; `Index.tsx` reads it on `/admin/preview/homepage` and renders `PreviewBanner`. Route registered in `App.tsx`.
- `usePublicProjects` selects `featured`; `SelectedWork.tsx` does the featured-first, recent-fill selection client-side from the existing query — no second request, and the projects page keeps using the same unmodified list.
- `AdminProjects.tsx` gets a featured switch per row/card and a header count; `AdminProjectForm.tsx` gets a featured checkbox in the same block as `published`.

**Verification**
- Upload a hero image in admin, reload the homepage, confirm the image renders and the text sits legibly over it at 1280px and 390px.
- Clear the headline, save, confirm the current copy returns rather than an empty heading.
- Toggle featured on four projects, confirm the homepage grid matches and `/projects` ordering is unchanged.
