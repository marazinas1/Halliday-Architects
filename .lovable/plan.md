# Projects module

The portfolio is the core of the site. This rebuilds it end to end: how images are processed and stored, how they are managed in the admin, how tags are maintained, and how the work is browsed publicly.

## Part 1 — Image pipeline

Project uploads currently use an old inherited path that encodes JPEGs at a fixed size and never touches the shared optimiser. They move onto the same pipeline as team photos and blog covers, using the existing `project` preset (2400px longest edge, WebP, EXIF stripped, ~1MB target) with per-file progress.

- Rewrite `src/lib/admin/imageUpload.ts` so uploads run through `optimizeImage(file, "project", onProgress)` and land as `<slug>/<category>/<uuid>.webp`.
- New storage bucket `project-images` replaces the inherited `property-images`. Confirmed by query: `projects`, `project_images` and the old bucket are all empty, so nothing is migrated and no backwards-compatibility handling is written.
- Storage cleanup keeps the verified-delete and folder-sweep behaviour already in place, so deleting an image, replacing a set, or deleting a project leaves nothing orphaned.

## Part 2 — Admin project images

Replace the current per-category list of plain file inputs with one image manager, reusing the interaction language established in the blog admin.

- One dropzone: drag several files at once or click to select. Each file gets its own thumbnail with a progress bar while it optimises and uploads; failures are reported per file, not for the whole batch.
- Thumbnail grid with drag-to-reorder (pointer and keyboard accessible), persisting `sort_order`.
- A single image marked as cover — an explicit `is_cover` flag on the row, enforced by the database. Categories stay independent and keep describing layout role only.
- Per-image category (hero / card / gallery) and alt text.
- Multi-select: click to select several thumbnails, then apply or remove tags across the whole selection in one action, writing to `image_tags`. Single-image tagging stays available from the thumbnail itself.
- Delete removes the row and the storage object.

## Part 3 — Tag management

A `Tags` area in the admin sidebar: add, rename, reorder (sort_order), delete. Deleting a tag removes only its `project_tags` / `image_tags` associations; images and projects are untouched. Inline creation of a new tag is also possible from the tagging control inside a project.

## Part 4 — Projects index

Rebuild `/projects` as an image-led grid: card image, title, location, year.

- Filter by project type (New build / Renovation / Interior / Addition) and by tag. Tag filtering matches projects that have a matching image tag or project tag, so a search for "stairs" surfaces the projects containing them.
- Filters are a quiet horizontal row of chips on desktop; on mobile they collapse into a sticky, thumb-reachable row that scrolls horizontally, with a clear count and reset. Filter state lives in the URL so a filtered view can be reopened directly.
- Empty state matches the tone used elsewhere: a bordered panel and one line of copy, not an error.

## Part 5 — Project detail

`/projects/:slug`:

- Full-bleed hero image with title, location, year and project type set over or beneath it, no heavy gradients or chrome.
- Client brief and story at editorial width, generous leading.
- Gallery in a mixed-width editorial layout — full-bleed, two-up and offset single images alternating by position and image orientation, so portraits and wide shots each read correctly rather than being cropped into a uniform grid.
- Lightbox on click, with arrow-key navigation, Escape to close and focus trapping.
- Specs and features rendered only when present.
- "Next project" link at the end, looping through published projects in order.
- Every image below the hero lazy-loads with width/height set to avoid layout shift.

## Technical notes

- Data: `project_images` gains no new columns; cover is expressed via the existing `card` category. Tag joins use the existing `tags` / `project_tags` / `image_tags` tables. No migration is expected; if a uniqueness guard on cover is wanted it would be a small structural migration only.
- New: `src/components/admin/ProjectImageManager.tsx`, `src/components/admin/TagPicker.tsx`, `src/pages/admin/AdminTags.tsx`, `src/hooks/admin/useTags.ts`, `src/hooks/admin/useImageTags.ts`, `src/components/Lightbox.tsx`, `src/components/projects/ProjectFilters.tsx`.
- Reworked: `src/lib/admin/imageUpload.ts`, `src/pages/admin/AdminProjectForm.tsx`, `src/pages/ProjectsPage.tsx`, `src/pages/ProjectPage.tsx`, `src/hooks/usePublicProjects.ts`, `AdminSidebar`, `App.tsx` routes.
- Reordering uses `@dnd-kit` (already the common choice in this stack); if it is not installed it will be added.

## Verification

Uploading several files at once produces WebP objects with visible per-file progress; reorder and cover selection survive a save and reload; tags apply to a multi-image selection in one action; filtering by tag on `/projects` returns only matching projects; the detail page renders correctly with mixed portrait and landscape images at 1280px and 390px; deleting a project leaves no objects under its slug in storage.
