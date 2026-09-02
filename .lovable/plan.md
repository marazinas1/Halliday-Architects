# Answers, and three fixes in the admin photography tools

## 1. The dropzone caption is wrong

It says "Resized to 2400px and converted to WebP automatically." The project preset actually resizes to 3000px on the longest edge (quality 0.86, WebP, EXIF stripped) — 2400px is left over from the older pipeline.

Fix: correct the caption to describe what really happens, without exposing numbers the client does not need:

> Large photographs are resized and converted to WebP automatically, then delivered at the right size for each screen.

The stale "2400px" comment in the upload helper is corrected at the same time.

## 2. What the star and the Hero / Card / Gallery choice do

- **Star = cover.** Exactly one photograph per project can be the cover. It is written through a database function that clears the previous cover in the same transaction, so it can never be set on two images. The cover is what the projects grid, the homepage wall and any automatic page photograph use.
- **Hero / Card / Gallery = layout role**, not the cover:
  - *Hero* — the wide photograph at the top of the project page.
  - *Card* — a shot intended for the small grid card.
  - *Gallery* — everything else, shown in the project gallery.
- **Why several can be Hero:** nothing currently stops it. The project page takes the first Hero by order and ignores the rest, so extra Heroes silently do nothing and are confusing.

Fix (behaviour, small): keep the roles as they are, but make the panel state the rule plainly and stop the silent-extra problem:
- One short line of help above the grid explaining star = cover, and what each role does.
- When a second photograph is set to Hero (or Card), the previous one drops back to Gallery — so exactly one Hero and one Card exist per project, matching what the public pages actually read.

## 3. "Choose your own" dialog is cramped

In the picker the project rail shows only about five projects and the photographs are cut off mid-row, leaving most of the dialog empty — the panels are not using the dialog's height.

Fix:
- Give the picker body a definite height so the project rail and the photograph grid both fill the dialog down to the bottom, and each scrolls independently.
- Widen the project rail (56 to 72) so titles are not truncated, and keep the search field pinned above it while the list scrolls.
- Larger thumbnails: three per row up to a large screen, four above it, in 4:3 with the role chip and the "currently used" mark unchanged.
- Same treatment on the Uploaded tab.
- On narrow screens the rail stays a select, as now.

## Technical notes

- `src/components/admin/ProjectImageManager.tsx` — dropzone caption, help line, single-Hero / single-Card enforcement on category change.
- `src/lib/admin/imageUpload.ts` — comment corrected to 3000px.
- `src/components/admin/ImagePicker.tsx` — height chain (`h-[70vh]` on the picker body rather than relying on nested `flex-1`), wider rail, larger grid.
- No database or public-page changes.

## Verification

Open a project: caption reads correctly; setting a second photograph to Hero moves the first back to Gallery; the star still moves the cover and the homepage follows it. In Home, "Choose your own" fills the dialog, the project list scrolls with all twelve reachable, and photographs fill the width.
