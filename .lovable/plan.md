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

**Governing rule for everything below: sharpness first.** Every slot gets a ceiling equal to its real rendered width at 2x pixel density — never less. That is the point where a photograph is indistinguishable from the master on a retina screen; below it, it goes soft. We only remove bytes that are genuinely invisible.

## Problem 0 — the homepage tiles are currently too soft (regression, fix first)

The homepage caps went below the retina requirement: the three bottom tiles are capped at 960px while rendering ~460px wide (920px needed at 2x, and they are 3:4 portrait so the real need is higher), and the three-across wall row is capped at 1400px at quality 78. That is why they look blurry.

Corrected homepage caps:

- Hero: 3000px, quality 85 (unchanged)
- Wall row of three: 2000px, quality 82
- Wall row of two: 2400px / 2000px, quality 82
- Projects / About / Contact tiles: 1600px, quality 82

## Problem 1 — large cards fetch oversized files elsewhere

Cards on `/projects`, the project gallery and the "next project" band pass a `sizes` hint but no ceiling at all, so a third-width tile can request a 2400–3000px master. Measured: two cards on `/projects` pulled 316 KB and 313 KB each.

Fix: give them the same retina-correct ceilings — enough to stay sharp, no more.

- Projects grid: full-width row 2400px, half-width 2000px, third-width 1600px; quality 82
- Project page gallery: 2000px, quality 82
- Lightbox (the enlarged view): 3000px, quality 88 — full quality where it is looked at closely
- "Next project" band and About/Services bands: 2400px, quality 82

Result: nothing on screen gets softer than it is today — the homepage tiles get visibly sharper — while the oversized fetches on the project pages come down.


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
