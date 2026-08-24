# Port the v6 homepage layout 1:1

Rebuild the homepage to match the uploaded `ha-homepage-v6.html` exactly — spacing, type scale, colours, alignment and section order — while every photograph, project, principal, testimonial and hero field keeps coming from the backend as it does today. Nav and footer are also brought in line with the draft (they are shared chrome, so the change applies site-wide).

## The two rules the draft is built on

1. **One alignment system.** Every section heading is centered. The only left-aligned block on the page is the hero copy panel.
2. **Two widths only.** `1440px` for the grids (work, services, process, testimonials, areas, footer, nav) and `56rem` for all centered prose. Principals get one exception at `76rem`. Nothing else — the current mix of `max-w-5xl` / `max-w-3xl` / `max-w-2xl` / 3-9 column heading rows goes away.

## Section order (final)

```text
Nav (sticky, solid white, 5rem, bottom hairline)
Hero (split: copy left, photo right)
Accreditations strip
The practice        — centered prose, 56rem
Selected work       — sand, 4-up grid, link centered below
Services            — 6 centered cards, link centered below
Approach band       — full-bleed photo + dark veil, eyebrow + statement
The process         — 4 centered numbered items
Testimonials        — sand, 3 centered quotes with red stars
The studio          — 2 centered portraits, 76rem, link centered below
Areas served        — slim strip with hairlines top and bottom
Closing CTA         — sand, centered, 56rem
Footer              — ink, 4 columns, social tiles, 2-item bottom bar
```

The dark statement band moves from near the bottom (today) up between Services and Process, gains the eyebrow "Our approach", and becomes a photograph behind a 62% ink veil. It reuses the hero image already stored in site settings — no new admin field, and it falls back to a plain ink band when there is no image.

## What changes in each section

**Nav** — becomes a sticky solid-white bar, 5rem tall, hairline bottom border. The transparent-over-hero treatment and its dark scrim are removed, so the `lightHero` prop and its branches disappear. Links, CTA button, logo and mobile menu keep working as today.

**Hero** — structure is already correct. Adjusted to the draft's exact values: brand-red eyebrow, headline capped by the draft's clamp so it never pushes the stats off screen at tablet widths, `40ch` subline, stacked full-width buttons on mobile, hairline stats strip, photo column minimum 600px on desktop. Hero image, parallax, failure fallback and all site-settings wiring untouched.

**The practice** — eyebrow, statement, body and the "About the practice" link, all centered on the 56rem measure with the draft's spacing; body capped at 44rem. Still database-driven.

**Selected work** — sand band, centered header, 2-up / 4-up grid of 4:5 cards. Hover: image scales to 1.05 over 700ms and a dark veil rises from the bottom with white meta + title. (Today's veil is white with ink text — it becomes dark.) The "View all work" link moves from the top right to centered below the grid. Mobile keeps its horizontal snap rail. Data flow unchanged.

**Services** — centered header, six centered cards (circular icon chip, title, description capped at 30ch), "All services" centered below. Still `HOMEPAGE_SERVICES`; `/services` keeps all eleven.

**Process** — centered header, four centered items with ink top-borders and stone numerals.

**Testimonials** — centered header with the line "Rated 5.0 from 43 client reviews", three centered quotes: five brand-red stars, quote at 34ch, hairline rule, name and detail. Still renders nothing when no testimonials are published.

**The studio** — centered header, two centered principals on a 76rem container: 4:5 grayscale portrait, name, role, hairline rule, bio. "Meet the studio" centered below. Principals still come from the database.

**Areas served** — stops being a tall sand section and becomes a slim strip with hairlines top and bottom: eyebrow, affiliations row, one line of copy, the ten towns.

**Closing CTA** — sand, centered on the 56rem measure, with the draft's spacing.

**Footer** — 4-column grid on the 1440px width (brand + tagline / Studio / Contact / Explore + social), square bordered social tiles, and a bottom bar with copyright left and Admin right.

## Technical notes

- New tokens in `src/index.css` matching the draft: display / section / card heading sizes with the draft's clamps and weights, `.statement`, `.body`, `.eyebrow`, `.link-inline` (underlined uppercase link whose gap widens on hover), and the two button variants.
- `src/lib/rhythm.ts`: reduce to the two widths (`grid` 1440px, `measure` 56rem) plus the `people` 76rem exception, and one `band` padding of 6rem; existing aliases stay exported so other pages keep compiling unchanged.
- Files touched: `src/pages/Index.tsx`, `src/index.css`, `src/lib/rhythm.ts`, `GlobalNav.tsx`, `GlobalFooter.tsx`, `SelectedWork.tsx`, `ServicesPreview.tsx`, `ProcessSection.tsx`, `Testimonials.tsx`, `TeamSection.tsx` (principals variant), `AreasServed.tsx`, `CTASection.tsx`.
- No database, hook, query or admin change. `useSiteSettings`, `resolveHomepage`, `usePublicProjects`, `useTeamMembers`, `useTestimonials` and the preview mode are all left exactly as they are.
- Other pages inherit the token and nav/footer changes; their own layouts are not edited.

## Verification

Rendered homepage at desktop and 390px mobile: section order and centering match the draft, both container widths hold from top to bottom, the hero image still swaps when changed in the admin, projects/principals/testimonials still come from the database, and the build log is clean.
