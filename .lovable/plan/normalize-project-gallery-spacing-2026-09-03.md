# Normalize project gallery spacing

## Confirmed cause

The project-detail gallery already declares `2px` for both row and column gaps, but each photo is rendered as an inline-level button inside the block-level `Reveal` wrapper. That creates a text-baseline strip beneath every photo row. The Projects archive does not show it because each card link is explicitly block-level.

## Change

- Make every project-gallery image button a block-level element while preserving its 4:3 frame, responsive image delivery, reveal animation, and lightbox behavior.
- Ensure the `Reveal` grid item and its child fill the same frame so no line-height or baseline space can contribute extra height.
- Leave the intended `2px` row and column gaps unchanged.

## Verification

- Measure rendered horizontal and vertical gaps on a real project page; both must resolve to exactly `2px`.
- Compare the detail gallery visually against `/projects` on desktop and mobile.
- Open a gallery image to confirm lightbox indexing and interaction still work.
- Check for console, hydration, and build errors.
