# Home V2 — an alternative homepage, shown alongside the current one

Yes, this is straightforward. The current homepage stays exactly as it is at `/`. A second, independent page is added at `/home-v2` built 1:1 from the uploaded `halliday-concept-a.html` concept. Nothing is shared with the current homepage except the site's data, so V2 can be deleted later with a single file removal and one route line.

## What the client will see at /home-v2

A photograph-led page, in the order of the concept:

```text
Nav          transparent, white text, overlaid on the first photograph
Photo wall   full-bleed photo / split pair (2 photos) / full-bleed photo
Manifesto    centered eyebrow "The practice" + one large light-weight statement
Tiles        3 tall 3:4 image tiles with dark veil: Projects, About, Contact
Footer       ink band, firm name, address and phone, centered
```

The concept uses grey placeholders. Real photographs replace them:

- The four wall photographs come from the published projects (cover images, in the same sort order the homepage already uses); the hero image from site settings leads if one is set.
- The three tiles reuse the next available project photographs.
- If fewer photographs are available, the remaining slots fall back to the concept's neutral gradient panel so the layout never breaks.
- The manifesto line comes from the homepage intro heading in site settings, so it stays editable; the concept's sentence is the fallback.
- The footer facts come from `src/content/firm.ts`.

Behaviour: nav links go to the real pages, tiles link to `/projects`, `/about`, `/contact`. Mobile follows the concept's rules — the split row stacks, tiles become one column, nav links hide behind the existing mobile menu.

## Not affected

`/` and every other page keep their current design. No shared component, token or CSS rule is edited, so there is no way for V2 to change V1. `noindex` already applies site-wide on the temporary domain, so V2 will not be indexed.

## Technical notes

- New file `src/pages/HomeV2.tsx` — self-contained: its own nav, wall, manifesto, tiles and footer markup, all styling in Tailwind using existing tokens (`ink`, `paper`, `stone`, `line`). No edits to `GlobalNav`, `GlobalFooter`, `index.css` or `rhythm.ts`.
- One route added in `src/App.tsx`: `/home-v2`, lazy-loaded like the other pages.
- Data through the existing hooks only: `useSiteSettings` and `usePublicProjects`. No database, migration or admin change.
- Images keep the existing rules: explicit width/height, `loading="lazy"` except the first wall photograph, alt text from the projects hook's `describeImage` fallback.
- Removing V2 later: delete `src/pages/HomeV2.tsx` and its route line. Nothing else to unwind.

## Verification

Rendered at desktop and 390px: `/home-v2` matches the concept's proportions and order, real project photographs fill the wall and tiles, links reach the right pages, and `/` is visually unchanged.
