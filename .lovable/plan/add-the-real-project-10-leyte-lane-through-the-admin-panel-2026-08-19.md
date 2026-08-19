# Add the real project "10 Leyte Lane" through the admin panel

Create the first real portfolio project exactly as you would do it yourself in the admin panel — same form, same image pipeline, same tags — using the eight photographs attached to this message.

## About the Dropbox link

I cannot read that Dropbox folder. Shared Dropbox links render through JavaScript and require a session, so the server only returns a login-ish HTML page, not the images. For every future project, the reliable options are:

1. Attach the files directly in chat (up to 10 per message, 20 MB each) — what you did here, and it works.
2. Or share a direct download link to a single ZIP (a Dropbox link ending in `?dl=1` that is public), which I can try to fetch. Folder-browse links will not work.

Attaching files stays the safest route.

## What gets created

A single project record, filled in as follows:

- Name: 10 Leyte Lane
- Slug: 10-leyte-lane
- City / State: Ocean City / NJ
- Project type: New build
- Year completed: left blank until you confirm the year
- Headline, tagline, description, client brief and story: drafted from what the photographs show (shingle-clad coastal home, coffered ceilings, white kitchen with island, bayfront deck and dock). Written factually — no invented client names, budgets or awards. You edit afterwards.
- Published: yes, so it appears on /projects immediately
- Sort order: 0

## The eight images

Uploaded through the admin image manager, so each one goes through the shared optimisation pipeline (2400px max, WebP, EXIF stripped) into the `project-images` bucket under `10-leyte-lane/`.

| File | Role | Category |
|---|---|---|
| EMP-152 | Front elevation | hero + cover |
| EMP-374 | Rear elevation from the dock | gallery |
| EMP-161 | Entry hall and stair | gallery |
| EMP-159 | Living room toward kitchen | gallery |
| EMP-156 | Living room with fireplace | gallery |
| EMP-180 | Kitchen and dining | gallery |
| EMP-189 | Dining room and bar | gallery |
| EMP-215 | Powder room | gallery |

One image is marked as cover, order follows the table, and each gets short alt text.

## Tags

Assigned from the existing vocabulary where they match: facades, kitchens, stairs, decks, bathrooms, fireplaces, interiors. Any tag that is genuinely needed and missing gets added to the vocabulary first.

## Technical notes

Rather than clicking the admin UI by hand, the work runs through the same code paths the admin uses: images are optimised locally with the identical preset, uploaded to the `project-images` bucket at `10-leyte-lane/<category>/<uuid>.webp`, then rows are inserted into `projects`, `project_images`, `project_tags` and `image_tags`. The cover is set via the `set_project_cover` function, so exactly one cover exists. The result in the admin panel is indistinguishable from a manual upload — fully editable and deletable from `/admin`.

## Verification

- `/projects` shows the project card with cover image, location and title
- `/projects/10-leyte-lane` renders hero, narrative and the mixed-width gallery, lightbox works
- `/admin/projects/.../edit` shows all eight thumbnails in order, cover marked, tags attached
- Stored files are WebP and under the size ceiling
