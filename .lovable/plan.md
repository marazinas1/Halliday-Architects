# Rebuild all project photography from the original files

The site ends with exactly the 12 projects that were in the SwissTransfer folders, and every photograph on the site comes from those originals, re-encoded with the new high-quality pipeline.

## What happens to each project

**8 projects that matched one-to-one** — 115 Anchor Road, 122 92nd Street, 2200 Wesley Avenue, 230 E Atlantic Blvd, 353 E Surf Road, 4607 5th Avenue, 5 Barbados Road, 55 Walnut Road.

In-place replacement. Every `project_images` row keeps its id, alt text, category (hero / card / gallery), sort order and cover flag. Only the stored file and its path change: new original is optimised, uploaded to a new path, the row is repointed, then the old file is deleted.

**4 hand-imported projects** — 111 Anchor Rd, 11605 Paradise Drive, 19 Flamingo Road, 262 Bayshore Drive.

Their current photographs are not the ones in the folders, so they are not matched — all of their image rows and storage files are deleted and the project is rebuilt from its folder (5, 9, 10 and 8 photographs respectively). First photograph in filename order becomes the hero and cover; the rest become gallery, in filename order.

Their written content (story, client brief, features) is removed, so all 12 projects have the same structure — title, location, type, photographs. Exception: 111 Anchor Rd keeps its story and brief, since that text describes the same house and still fits.

Nothing else is deleted; the 12 project records themselves stay, so slugs and URLs are unchanged.

## Photograph quality

Originals are large camera files, so they are re-encoded rather than shipped raw:

- Cover / hero photographs: 3200px longest edge, WebP q0.88
- All other photographs: 3000px longest edge, WebP q0.86
- EXIF stripped

These are the presets already defined in the app's image pipeline, applied server-side here because the files never pass through the browser uploader.

Delivery stays fast because the site does not serve the master. `ResponsiveImage` requests 640 / 960 / 1400 / 2000 / 2800px variants through the storage transformation endpoint and the browser picks the one the screen actually needs — a phone downloads ~600px, a Retina laptop ~2000px, a large display 2800px. That is the current industry norm (a full-bleed photograph landing in the 200–500KB range while still being sharp at 2x).

## Homepage hero

The homepage hero is filled automatically by the first published project's cover photograph, which today is 111 Anchor Rd. That project is rebuilt from its originals, so the hero keeps coming from the same house and simply becomes a sharper file. No slot needs to be re-picked by hand.

## Order of work

1. Replace the 8 matched projects, one project per batch, verifying each before the next.
2. Rebuild the 4 remaining projects from their folders.
3. Clear story / brief / features on 11605 Paradise Drive, 19 Flamingo Road, 262 Bayshore Drive.
4. Sweep storage for any object under a project slug that no row references, and delete it.
5. Check the live pages: homepage, projects index, all 12 detail pages, About, Services, Contact — no missing images, hero sharp at Retina scale.

## Technical notes

- Processing runs in a sandbox script (PIL + Supabase storage API); no app source files change.
- Every upload goes to a new UUID path so the year-long cache can never serve a stale file; the old object is deleted only after the database no longer references it.
- `page_media` currently has no rows, so no manually chosen slot can break; the check is still run before deleting.
- A JSON log of old path → new path per project is kept for audit.
- Extra originals beyond what a project needs are listed at the end rather than silently added.
