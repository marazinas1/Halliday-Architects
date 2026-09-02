# Homepage hero image sharpness

## What I measured

The hero photograph you set as the developer default is stored at full quality:

- Master file in storage: **3000 x 2000 px**, WebP, 1.5 MB — nothing was lost when it was copied into the defaults layer.
- Largest variant the page offers the browser today: 2800 px wide.
- What the browser actually downloaded on a 1280 px desktop window: **640 x 426 px**.

So the upload is fine. The delivery is not: the browser is being told the hero only needs half the window width, so it picks one of the smallest variants and stretches it across a full-bleed, full-height hero. That is exactly the softness you are seeing.

## Cause

Every photograph on the homepage is rendered through one shared frame component that always declares the same `sizes` hint: "half the window on desktop, full width on phones". That hint is correct for the three-across and two-across rows, but wrong for the hero, which is full-bleed. It is also wrong for the two-across row on large screens where each image is wider than half the window minus gaps.

Because `sizes` is the only thing the browser uses to choose from the variant list, an understated value silently downgrades the image no matter how large the master is.

## The fix

1. Give the photo frame a per-slot `sizes` value instead of one hard-coded string:
   - hero: `100vw`
   - three-across row: `(min-width: 768px) 33vw, 100vw`
   - two-across row: `(min-width: 768px) 58vw, 100vw`
   - the three bottom tiles: `(min-width: 768px) 33vw, 100vw`
2. Add a 3000 px entry to the responsive variant list so the master's full resolution is reachable on large, high-density displays (currently the list stops at 2800).
3. Raise the transformation quality for the hero-scale variants from 80 to 85 — at hero size the difference is visible and the file stays reasonable.
4. Apply the same per-slot `sizes` correction to the other full-bleed photography that uses the same component (project hero, About strip, Services bands, Contact hero), since they inherit the identical wrong hint.

## Verification

After the change I will reload the homepage in a real browser at desktop and at 2x pixel density and report the actual pixel width downloaded for the hero. Target: 2000-3000 px, not 640.

## Technical notes

- `src/components/ResponsiveImage.tsx`: extend `WIDTHS` with 3000, allow a per-instance quality override.
- `src/pages/Index.tsx`: `PhotoFrame` takes a `sizes` prop; each section passes its own.
- Sweep other callers of `ResponsiveImage` for the copied `(min-width: 1024px) 50vw, 100vw` default and correct each to its real layout width.
- No database, storage or admin changes — the defaults layer and the role restrictions stay exactly as they are.
