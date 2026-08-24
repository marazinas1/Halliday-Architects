# Homepage visual refinement — four scoped changes

Visual-only rework of the homepage. All existing Supabase wiring (hero image from `site_settings`, projects, principals, `HOMEPAGE_FALLBACKS` resolution) stays exactly as it is. No other page is touched except two shared pieces the homepage depends on: `GlobalNav` (its `lightHero` usage) and the global typography tokens in `index.css`.

## 1. Hero → two-column split (text left, photo right)

File: `src/pages/Index.tsx` (hero section only).

**Desktop (lg+):** CSS grid `lg:grid-cols-[0.9fr_1.1fr]`, min-height `calc(100svh - 5rem)` (nav height).

- **Left column** — white/paper background, vertically centered, left-aligned:
  - Eyebrow "Best of Houzz · Service · 2016 – 2024" restyled for the light surface: plain text, brand-red, uppercase, `tracking-widest`, `text-[11px] font-semibold`. The dark glass pill and border go away.
  - H1 (`content.heroHeadline`) in ink, `max-w-[13ch]`, keeps `whitespace-pre-line` for the two-line break.
  - Subline (`content.heroSubline`) in stone, `max-w-[40ch]`.
  - Buttons: "Start a project" solid ink, "View our work" outline — the single light-surface variant only (the `heroUrl` conditional coloring is deleted; these classes always apply now).
  - **Stats strip below the buttons**, separated by a top hairline border + padding: horizontal row of the three `STATS` items — figure (`text-2xl md:text-3xl font-extrabold` ink), label (`text-[11px] uppercase tracking-wide`), detail (`text-[11px]` stone), left-aligned. This **replaces and deletes** the floating glass stats bar at the bottom of the hero.
- **Right column** — hero photograph fills the column (`absolute inset-0 object-cover`). Preserved untouched:
  - same `heroUrl` from `content.heroImageUrl` (site_settings bucket/path),
  - same `heroFailed` onError → sand fallback (right column renders `bg-sand` when no image),
  - same rAF parallax effect and `imageRef`.
  - The full-viewport scrim gradients are deleted — nothing sits over the photo anymore.

**Mobile/tablet (below lg):** single column. Photo first (order-first, ~`h-[320px]`), then the white text block below: eyebrow, headline, subline, buttons full-width stacked (`w-full`), then the stats row. No overlays.

**Nav treatment:** the split hero is a light surface, so `GlobalNav` gets `lightHero` unconditionally on the homepage (`<GlobalNav lightHero />` instead of `lightHero={!heroUrl}`) — dark text over the white left half, always legible. `GlobalNav.tsx` itself needs no edit; only the prop call site in `Index.tsx`.

**Kept:** the quiet `ACCREDITATIONS` line directly below the hero, unchanged.

## 2. Homepage services — 6 grouped items

- `src/content/firm.ts`: add a second export `HOMEPAGE_SERVICES: Service[]` with the six grouped services exactly as specified (New homes / Additions & renovations / Restoration / Kitchens & interiors / Pool houses & outbuildings / Sustainable design, with the given descriptions and icons). The existing `SERVICES` array stays untouched — `/services` keeps the full eleven.
- `src/components/sections/ServicesPreview.tsx`: map over `HOMEPAGE_SERVICES` instead of `SERVICES`. Same card markup (circular bordered icon chip, title → brand-red on hover, description). Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — six items fill it evenly. Add a quiet "All services →" link in the section header (right side of the header row) pointing to `/services`.

## 3. Typography weight discipline

File: `src/index.css` — four weight values only, nothing else:

- `.heading-display`: `font-extrabold` → `font-bold` (700)
- `.heading-section`: `font-extrabold` → `font-bold` (700)
- `.heading-card`: `font-extrabold` → `font-semibold` (600)
- `.statement`: stays `font-light` (300) — the deliberate light accent.

Font family (Urbanist), sizes, tracking, colors unchanged. (Note: these tokens are used on other pages too, but the change is a token-level weight adjustment, not a layout change — the user asked for one consistent voice site-wide.)

## 4. Sharp corners everywhere (homepage surfaces)

Remove radius from homepage elements; only the circular service icon chips keep `rounded-full`:

- Hero buttons (`rounded` → none) and the stats strip container — in `Index.tsx`.
- `SelectedWork.tsx`: card frames and images currently `rounded-[4px]` → squared (mobile stacked card and desktop hover card).
- `CTASection.tsx` (homepage closing CTA): `rounded` on the button → removed.
- `GlobalNav.tsx`: `rounded` on the "Start a project" CTA (desktop + mobile menu) → removed, so the chrome matches the sharp system. This is shared chrome; it applies site-wide, which matches the intent "sharp everywhere".

## Out of scope / preserved

- No changes to `useSiteSettings.ts`, `resolveHomepage`, `HOMEPAGE_FALLBACKS`, parallax logic, `heroFailed` handling, or any query.
- `SelectedWork` data flow, `PrincipalsGrid`, Testimonials, Process, Areas Served sections untouched (except the token-level font weight shift they inherit).
- `/services` page untouched.

## Technical notes

- Files edited: `src/pages/Index.tsx`, `src/content/firm.ts`, `src/components/sections/ServicesPreview.tsx`, `src/index.css`, `src/components/sections/SelectedWork.tsx`, `src/components/CTASection.tsx`, `src/components/GlobalNav.tsx` (prop callsite is in Index; nav edit is only the two `rounded` classes).
- New icons needed in `firm.ts` imports: none — `Home`, `SquarePlus`, `Landmark`, `ChefHat`, `Waves`, `Leaf` are already imported for `SERVICES`.
- Hero min-height uses `calc(100svh - 5rem)` with the existing `min-h-[100svh]` pattern adapted; mobile photo height ~320px.

## Verification (rendered homepage)

1. Desktop: split hero — white text column left, photo right half only; change the hero image in `/admin/homepage` and confirm it swaps; with no image the right half is sand.
2. Mobile 390px: photo on top, text below, full-width buttons, stats row, no overlap.
3. Nav dark text over the white left half.
4. Services: exactly 6 items, full grid, "All services →" → `/services` (full 11 still there).
5. Selected work and principals still render from the database.
6. Headings read as one weight family; only the practice statement/dark band are light.
7. No rounded corners anywhere except the circular service icons.
