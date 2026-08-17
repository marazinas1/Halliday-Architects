# Homepage rebuild

The homepage becomes the page that tells a visitor who Halliday Architects are within seconds, then leads into the work. Image-first, quiet typography, generous space.

## Structure, top to bottom

1. **Hero** — full-bleed neutral placeholder image, dark gradient scrim, one restrained line: "Architecture for the Jersey Shore" with a small supporting line naming what they do and where (custom homes, renovations, multi-family — Ocean City, New Jersey). No button, no marketing slogan. Scroll cue only.
2. **Introduction** — editorial width, two to three sentences on the practice. Copy is clearly marked as placeholder in a code comment so it is obvious what still needs the client's words.
3. **Selected work** — up to six published projects, image-led, each showing title and location, linking to its project page, plus one quiet text link through to the full projects page.
4. **Practice statement** — a single quiet line on an ink (dark) band, giving the page rhythm.
5. **Closing** — a short invitation to get in touch: one line plus a text link to the contact page. No form, no hard sell.

Existing sections currently on the homepage (services preview, about block, consultation CTA) are removed from this page; the Services and About pages keep their own content untouched.

## Empty state

The projects table has no rows yet. Rather than filling the grid with invented placeholder projects, Selected Work renders an intentional empty state: a bordered panel at editorial width with a short line noting the portfolio is being prepared, plus a link to the projects page. The grid also has a loading skeleton (neutral sand blocks) while the query runs, so the page never flashes empty.

## Design rules applied

- All vertical spacing, container widths and gaps come from `src/lib/rhythm.ts` — no ad-hoc padding values.
- Headings Newsreader light, body Inter; colours limited to paper, sand, ink, stone, line and brand.
- Brand red only on link hover and small markers.
- Motion stays as the existing fade-and-translate reveal.

## Dark mode removal

The `.dark` block in `src/index.css` is deleted. It redefines `--ink` and `--stone` with inverted values, which would flip text colours on systems set to dark. The palette is light-only. Any `darkMode` toggle left in `tailwind.config.ts` is left in place but no longer has variables behind it; the `next-themes` provider is not added anywhere.

## Technical notes

- New file `src/components/sections/SelectedWork.tsx` reading from the existing `usePublicProjects` hook (already filters `published = true` and orders by `sort_order`), sliced to six.
- `src/pages/Index.tsx` rewritten to the five sections above; hero image stays `/placeholder.svg` until real photography arrives.
- `PortfolioSection.tsx` and its invented placeholder projects are no longer used by the homepage. It stays in place for the projects page, which is out of scope for this task.
- SEO title and description on the homepage stay as they are.

## Verification

Render the homepage at desktop (1280px) and mobile (390px) widths with an empty projects table, confirm the empty state reads as intentional, check no hardcoded colour classes were introduced, and confirm no console errors.
