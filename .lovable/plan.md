# Interior heroes, homepage composition, contact map

## 1. Fix placeholder images

`PageHero.tsx` and `AboutSection.tsx` are the only two places rendering `/placeholder.svg`.

- `PageHero`: keep height, typography and overlay exactly as they are. Replace the `<img src="/placeholder.svg">` with a flat ink block rendered in the same position. The `image` prop stays optional, so passing a real photo later is a one-line change per page.
- `AboutSection`: replace the placeholder image with a flat sand/ink block at the same aspect ratio, same slot, same one-line swap when photography arrives.

## 2. Homepage and services

New sections between Selected Work and the statement band:

- **Services preview** — the four services from `src/content/firm.ts` in a row. Each item leads with a large Newsreader light numeral (01–04) in a pale stone/line tone, noticeably larger than the title, then title and one-line description. Each links to `/services`.
- **Studio preview** — a short line about the practice being led personally by both principals, with a link to `/team`.

Same numeral treatment replaces the divider/icon treatment on the services page cards.

Heading alignment: use "Residential architecture in Ocean City, New Jersey" on both the homepage and About; drop "Architecture for the Jersey Shore".

Layout changes (presentation only):

- Left-align section headings; content sits in asymmetric columns (e.g. label column + wider content column) rather than centred blocks. Applies to homepage sections, Services, and the About/Team heading blocks touched here.
- Stronger scale contrast: large display headings against small uppercase labels.
- Hover states, 400–600ms ease-out: image scale on project cards, underline drawing in on text links, colour shift to brand red. Added as shared utility classes in `src/index.css` so they stay consistent.
- Section backgrounds alternate paper / sand / ink down the page for rhythm.

No shadows, gradients, rounded cards, or decorative flourishes. All spacing still from `src/lib/rhythm.ts`.

## 3. Contact map

Add `maplibre-gl` and render a full-width band below the contact details, replacing the current Google Maps iframe.

- CARTO Positron raster tiles (no API key), muted with a light desaturation filter so it reads as context.
- Centred on 728 West Avenue, Ocean City NJ with a single small marker in the palette (ink dot / brand red accent), zoom ~15.
- Non-scroll-hijacking: scroll zoom off, drag pan on; attribution kept.

## Technical notes

- New files: `src/components/sections/ServicesPreview.tsx`, `src/components/sections/StudioPreview.tsx`, `src/components/ContactMap.tsx`, plus a small shared `ServiceNumeral` treatment reused by the services page.
- Dependency added: `maplibre-gl` (plus its CSS import).
- Existing Google Maps iframe in `ContactSection.tsx` is removed.

## Verification

- Grep for `placeholder.svg` in `src` — zero rendering usages.
- Homepage, Services, Contact checked at 1280px and 390px: numerals render at both widths, hover states behave, map loads with no console errors.
