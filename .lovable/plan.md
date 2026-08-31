# Home V3 concept, a Home dropdown, and real photography in V2/V3

## What you get

1. A third demonstration homepage at `/home-v3`, built exactly from the concept B markup you supplied: full-bleed hero with a caption over a dark scrim, an accreditation strip, a centred practice statement, a "Selected work" block (one wide featured photograph plus two square ones), and a sand-coloured closing band with a "Start a project" link.
2. The main navigation's "Home" item becomes a dropdown listing Home V1, Home V2 and Home V3, so you can switch between the concepts in front of the client. On mobile the three appear as indented items under Home.
3. Both V2 and V3 carry the firm's real logo in white over the photography, instead of the plain text wordmark.
4. Both V2 and V3 select their photographs from real project imagery rather than taking whatever comes first — landscape images for the wide slots, portrait/square for the tiles, so the pages look composed like the reference PDF.

## Photograph selection

A small shared helper picks images from the published projects:

- Hero/featured slots: the homepage hero image if one is set in the admin, then project hero/cover images, preferring wide ones.
- Grid and tile slots: cover and gallery images, preferring taller crops for the 3/4 tiles.
- One image per project first, so no project repeats before every project has appeared.
- Alt text keeps using the existing `describeImage` fallback.

If a slot has no photograph, the existing neutral gradient placeholder still shows, so the pages never break.

## Technical notes

- New `src/pages/HomeV3.tsx`, self-contained like `HomeV2.tsx` (own nav, footer, styles); route registered in `src/App.tsx`. Deleting the file and the route removes the concept cleanly.
- New `src/lib/conceptPhotos.ts` holding the selection helper, used by both V2 and V3; it reads from the existing `usePublicProjects` data — no schema or backend changes.
- `src/components/GlobalNav.tsx`: "Home" becomes a hover/click dropdown (desktop) and a nested list (mobile) with the three routes. The rest of the nav is unchanged; V1 stays exactly as it is.
- V2 and V3 use `BrandLogo` with `variant="dark"`, which knocks the mark out to white over imagery.
- Styling stays on Urbanist and the existing paper/sand/ink/stone/line tokens; no border radius, matching the concept.
- SEO on `/home-v3` mirrors V2 (`noindex` remains site-wide during development).
