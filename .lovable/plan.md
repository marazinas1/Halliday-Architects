# Roll back the last loading-performance change

The previous task added three experimental mechanisms to make the homepage feel faster. Together they are what makes the three cards look chopped and load strangely on hover. This plan removes them and returns to the clean, predictable behaviour from before, while keeping the correct image sizing (which was a genuine fix, not the cause of the glitch).

## What gets removed

1. **Blur-up placeholder** — the tiny 32px blurred copy behind every photograph, plus its 400ms fade. This is what makes images appear to "assemble" oddly. Photographs will simply appear when they load, on the plain sand-coloured background as before.
2. **localStorage caching of page content** — restoring the previous payload from browser storage made the first frame show stale or mismatched photographs before the real data arrived. Content will be fetched normally again.
3. **Manual hero preload link** — the injected `<link rel="preload">` in the homepage duplicated the hero request in some cases. The hero keeps `fetchpriority="high"` on the image itself, which is the standard approach and is enough.

## What stays

- Correct `sizes` hints per slot (hero 100vw, thirds 34vw, etc.) — this is what keeps files appropriately sized.
- Reasonable quality and maximum-width caps per slot, so small tiles never download a 3000px master.
- Lazy loading below the fold.

## On image weight (answer to the wider question)

Measured on the running site at a 1440px desktop:

- Home: 19 images, ~980 KB total (hero 515 KB)
- Projects: 10 images, ~1.2 MB total
- About: ~590 KB

These are healthy numbers. The world standard for a photography-led site is roughly 1–2 MB per page and under ~600 KB for a full-bleed hero, so nothing is oversized. Upload presets (3000px project, 3200px hero, WebP) are also in line with practice — 2400px would be slightly leaner but visibly softer on large retina screens, so keeping 3000px for masters and letting the delivery layer shrink per slot is the right trade. The slowness you feel on refresh is data-fetch latency plus the visual tricks listed above, not file weight.

## Technical detail

- `src/components/ResponsiveImage.tsx`: drop the `blurUp` prop, the placeholder layer, the `loaded` state and the opacity transition; keep `srcset`, `sizes`, `maxWidth`, `quality`, `priority`.
- `src/hooks/usePageContent.ts`: remove `CACHE_KEY`, `CACHE_TTL`, the localStorage read/write and the hydrated initial state.
- `src/pages/Index.tsx`: remove the preload `useEffect` and the `buildSrcSet` import; remove `blurUp` from `PhotoFrame`.
- Verify afterwards on `/`, `/projects` and `/about`: no flashing, hover zoom smooth, hero still delivered at 2000/3000px.
