# Home page: three photographs, no cropped rooftops

## What changes

The photo wall goes from four photographs to three:

```text
┌───────────────────────────────┐
│                               │
│   1  opening photograph       │  fills the screen on open
│                               │
└───────────────────────────────┘
┌──────────────┬────────────────┐
│   2          │   3            │  equal pair, squarer frames
└──────────────┴────────────────┘
        "The practice"
```

The closing full-width photograph (the fourth) is removed everywhere — page, admin, and the stored slot.

## Framing (the cropped-house problem)

Your photography is close to 4:3, so today's very wide frames slice off roofs.

- Opening photograph: fills the window on load but is capped at a 3:2 shape, so on wide laptops it stays tall enough to keep the roofline in frame instead of becoming a letterbox strip. On phones it becomes a tall 4:5 frame.
- Second row: two equal frames at 4:3 (not 1.4fr / 1fr as now), matching the framing in your second screenshot. On phones they stack, each 4:3.
- Each photograph keeps a focal point setting so if one still crops badly it can be nudged (top / centre / bottom) — I'd default all three to centre.

## Parallax — my recommendation

Yes on the opening photograph, no on the pair.

- Opening: the StageHomy treatment (image scaled slightly larger than its frame, drifting a few percent slower than the scroll). It reads as depth, not movement, and it suits a single hero.
- The pair: no parallax. Two side-by-side frames each drifting at once looks restless and, being shorter frames, the drift forces extra crop — the exact thing you're trying to avoid.
- Mobile: parallax off entirely (it fights momentum scrolling and stutters). Also off for anyone with reduced-motion enabled.

The existing fade-in reveal stays on all three.

## Admin

Website > Home shows three photograph slots instead of four:

1. Opening photograph — full screen, 3:2 preview
2. Second photograph (left) — 4:3 preview
3. Third photograph (right) — 4:3 preview

Guidance text updated to say roughly-square originals work best. The old fourth slot is dropped from the slot list and its stored row removed so no orphan record stays behind.

## Technical notes

- `src/pages/Index.tsx`: wall array `wall_1..wall_3`; hero wrapper `aspect-[4/5] sm:aspect-[3/2] max-h-[100svh] min-h-[560px]`; pair becomes `md:grid-cols-2` with `aspect-[4/3]`; fourth `<Reveal>` block deleted.
- New `ParallaxPhoto` wrapper (rAF + `transform: translate3d`, `matchMedia` guards for `md` and `prefers-reduced-motion`), used only by the hero; `PhotoFrame` gains an `objectPosition` prop.
- `src/hooks/useResolvedPageImages.ts`: remove `wall_4` from the home slot list.
- `src/pages/admin/AdminHome.tsx`: three slot definitions with updated labels, help text, aspect previews.
- Migration: delete the `page_media` row for `home` / `wall_4`.
