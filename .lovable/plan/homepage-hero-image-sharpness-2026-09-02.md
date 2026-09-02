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

## The fix — maximum sharpness, controlled weight

The goal is the sharpest possible homepage without a slow first load. That means: correct size hints so no image is ever upscaled, a higher ceiling for the hero only, and everything below the fold left lazy and light.

1. Give the photo frame a per-slot `sizes` value instead of one hard-coded string:
   - hero: `100vw`
   - three-across row: `(min-width: 768px) 33vw, 100vw`
   - two-across row: `(min-width: 768px) 58vw, 100vw`
   - the three bottom tiles: `(min-width: 768px) 33vw, 100vw`
2. Add a 3000 px entry to the variant list so the master's full resolution is reachable on large, high-density displays (currently it stops at 2800).
3. Quality tuned per role rather than one flat number: hero variants at 85, the smaller homepage images at 80, everything else unchanged. At hero scale 85 is visibly cleaner; below the fold it would only add weight.
4. Keep the load fast: only the hero is eager and high-priority — every other photograph stays lazy, so the first paint downloads one large image, not six. Expected hero payload on a 2x desktop is roughly 900 KB - 1.2 MB, which is normal for a full-bleed architectural hero and arrives while the rest of the page is still lazy.
5. Apply the same per-slot `sizes` correction to the other full-bleed photography using the same component (project hero, About strip, Services bands, Contact hero), which inherits the identical wrong hint.


## Verification

After the change I will reload the homepage in a real browser at desktop and at 2x pixel density and report the actual pixel width downloaded for the hero. Target: 2000-3000 px, not 640.

## Technical notes

- `src/components/ResponsiveImage.tsx`: extend `WIDTHS` with 3000, allow a per-instance quality override.
- `src/pages/Index.tsx`: `PhotoFrame` takes a `sizes` prop; each section passes its own.
- Sweep other callers of `ResponsiveImage` for the copied `(min-width: 1024px) 50vw, 100vw` default and correct each to its real layout width.
- No database, storage or admin changes — the defaults layer and the role restrictions stay exactly as they are.
