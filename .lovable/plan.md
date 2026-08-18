# Team in the database, with a reusable image pipeline

## Part 1 — Shared image optimisation utility (built first)

New module `src/lib/images/optimizeImage.ts`, built on `browser-image-compression` (well-maintained, web-worker based, strips EXIF by re-encoding).

- Per-use-case presets: `headshot` (1200px long edge), `project` (2400px), `cover` (1800px) — each with its own max dimension, WebP quality, and max file size.
- Converts to WebP, preserves aspect ratio, strips metadata.
- Skips re-encoding when the source is already under the preset's size and dimension budget.
- Rejects non-image files with a plain message ("That file is not an image").
- Reports progress via a callback so upload UI can show a bar.

New `src/lib/admin/uploadImage.ts` helper wraps optimise + upload to a given bucket/path and returns the storage path. Project images keep working as they do today; they can be migrated to this pipeline in a later pass.

## Part 2 — team_members table and admin CRUD

Migration (structure only, no client data):

- `team_members`: id, name, role, credentials, bio, photo_path, sort_order, published, created_at, updated_at (with the existing updated_at trigger).
- GRANTs, RLS mirroring `projects`: public reads `published = true`, admins do everything via `is_admin()`.
- New public storage bucket `team-photos` with admin-only write policies.

Admin at `/admin/team`, matching the existing Projects admin structure (AdminProtected + AdminShell, table list, shadcn components, TanStack Query hooks):

- List view: photo thumbnail, name, role, order, published switch, edit and delete actions.
- Add / edit form: name, role, credentials, bio, photo upload with preview and progress, replace photo, published toggle.
- Reordering with up/down controls that write `sort_order`.
- Delete: confirmation dialog, then the storage object is removed **before** the row, and replacing a photo deletes the old file. No orphans.

A "Team" link is added to the admin navigation.

## Part 3 — Public pages read from the database

- `useTeamMembers()` hook fetches published members ordered by `sort_order`.
- `TeamSection` renders the photo when `photo_path` exists, and keeps the current initials block as the fallback.
- Team page and the studio section on the About page both use the hook, so an admin upload appears immediately with no rebuild.
- The hardcoded `TEAM` array and `TeamMember` type are removed from `src/content/firm.ts`; firm facts stay.

## Part 4 — Seed the current five

Seeded as data (not in a migration): the five people, bios left empty, published, in the given order.

Photos are pulled from the current Squarespace team page, run through the same headshot preset, and uploaded into `team-photos` so they behave exactly like admin uploads and are replaceable without code changes.

Note found while checking the live site: only four real headshots exist there — Shannon Halliday, Brett Hagerty, Christy Hill and Samantha Cozzi. **Chris Halliday's slot on the current site uses a generic "Placeholder.jpg"**, so he will be seeded with no photo and will show the initials fallback until a real headshot arrives.

## Verification

- Upload a photo in admin: resulting file is WebP and clearly smaller than the original.
- The uploaded photo appears on `/team` without a rebuild.
- Deleting a member removes both the row and the stored file (verified by listing the bucket).
- `/team` and the About studio section render cleanly with a mix of photo and initials-only members, at 1280px and 390px.

## Technical notes

- New dependency: `browser-image-compression`.
- New files: image utility, upload helper, `useTeamMembers` / admin team hooks, `AdminTeam` list page, `AdminTeamForm`.
- Routes added to `src/App.tsx`: `/admin/team`, `/admin/team/new`, `/admin/team/:id/edit`.
- English only; no translation layer is introduced.
