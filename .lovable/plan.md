# Image quality standards and site speed audit

## Short answers first

**Is 3000px right, or was 2400px correct?** The world standard for a photography-led architecture site is masters of **2400–3200px** on the long edge, stored once, and then *delivered* resized per slot. 3000px masters are fine and not the cause of any slowness — nobody ever downloads the 3000px file except a very large retina screen viewing a full-bleed hero. So keep 3000px (hero 3200px) and fix delivery instead.

**Are pages heavy today?** Measured on the running site at 1440px desktop:

| Page | Images | Total |
|---|---|---|
| Home | 19 | ~980 KB |
| Projects | 10 | ~1.2 MB |
| About | 9 | ~590 KB |

That is inside the healthy 1–2 MB range. Nothing is oversized in absolute terms.

**But there are two real problems, and one of them gets worse with every project you add.**

## Problem 1 — small cards fetch large files on retina screens

Cards on `/projects`, the project gallery and the "next project" band pass a `sizes` hint but no ceiling. On your screen (2x pixel density) a one-third-width card therefore requests a **2000px** variant. Measured: two cards on `/projects` pulled 316 KB and 313 KB each — for tiles a few hundred pixels wide.

Fix: cap each slot at the largest variant it can actually use, exactly as the homepage already does.

- Projects grid: full-width row max 2000px, half-width 1600px, third-width 1200px; quality 76
- Project page gallery: max 1600px, quality 78
- Lightbox (the enlarged view): max 2400px, quality 85 — this is where the big file belongs
- "Next project" band and About/Services bands: max 2000px, quality 78

Result: the grid stays visually identical while its weight drops by roughly half, and clicking a project still shows the full-resolution photograph.

## Problem 2 — every page downloads the whole image catalogue

`usePublicProjects` is used by Home, Projects, About and Services. On each of those pages it fetches:

- every row of `project_images` for every published project (all categories, all gallery photos — currently well over a hundred rows), only to pick **one** cover per project
- the entire `image_tags` table with no filter

This is the direct answer to "will the site get slower as more projects are added": yes, as currently written. Every new project adds 15–25 rows to a payload that every visitor downloads on the first page they open.

Fix: narrow the query so the cost stops growing with the archive.

- Select only the columns needed for a cover and restrict to cover/card/hero candidates
- Filter `image_tags` to the fetched image ids instead of pulling the table
- Keep the results cached across pages in the query client (`staleTime`) so navigating Home → Projects → About does not refetch

## What stays as it is

- Upload presets: project 3000px, hero 3200px, blog cover 2000px, body 1600px, headshot 1200px, all WebP — these are correct.
- Homepage hero at quality 85, full 3000px available for large retina displays.
- Lazy loading below the fold and the per-slot `sizes` hints.

## Verification after the change

Re-measure `/`, `/projects`, `/about` and a project detail page at 1440px in both 1x and 2x, and report before/after totals plus the largest variant fetched per page. Target: `/projects` under ~600 KB at 1x and no card requesting a variant wider than its cap.

## Technical detail

- `src/pages/ProjectsPage.tsx`, `src/pages/ProjectPage.tsx`, `src/pages/AboutPage.tsx`, `src/pages/ServicesPage.tsx`, `src/components/blog/PostCard.tsx`: add `maxWidth` and `quality` per slot.
- Lightbox component used by `ProjectPage`: render through `ResponsiveImage` with `maxWidth={2400} quality={85}` if it currently uses a raw `<img>`.
- `src/hooks/usePublicProjects.ts`: narrow `project_images` select and add `.in("category", [...])`; filter `image_tags` by `image_id`; add `staleTime: 5 * 60_000`.
- No database migration, no change to stored files.
