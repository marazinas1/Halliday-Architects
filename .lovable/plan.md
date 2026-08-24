# Adopt selected sections from the Claude homepage draft

Take five ideas from the draft HTML and rebuild them with the project's existing design system (Urbanist, white/grey tokens, rhythm.ts, Reveal). **Hero stays exactly as it is.** All existing scroll-reveal motion and StageHomy styling are preserved.

## 1. "The practice" intro — centered layout (`src/pages/Index.tsx`)

- Replace the current 3/9 split grid with Claude's centered composition (matches the reference screenshot):
  - Eyebrow "The practice" centered
  - Statement (`content.introHeading` from site_settings) centered, `max-w-3xl mx-auto text-center`
  - Body (`content.introBody`) centered, `max-w-2xl mx-auto`
  - "About the practice" link centered beneath
- Copy stays database-driven — only alignment/typography change.

## 2. Services — Houzz list with icons (`src/content/firm.ts`, `ServicesPreview.tsx`, `ServicesSection.tsx`)

- Replace `SERVICES` with the 11 services from the firm's Houzz "Services Provided":
  Architectural Design, Building Design, Home Remodeling, Custom Homes, New Home Construction, Home Additions, Kitchen Design, Kitchen Remodeling, Green Building, Pool House Design & Construction, Home Restoration.
- Each gets a Lucide icon (e.g. `DraftingCompass`, `Building2`, `Hammer`, `Home`, `HardHat`, `PlusSquare`, `ChefHat`, `UtensilsCrossed`, `Leaf`, `Waves`, `Landmark`) and one short factual description. The `Service` type gains an `icon` field; `detail` is dropped.
- **Homepage (`ServicesPreview`)**: Claude's style — bordered circular icon chip, `heading-card` title, small stone description; responsive grid 1/2/3 columns (11 items).
- **Services page (`ServicesSection`)**: same icon-chip cards replace the large numerals so both pages match; the "Building on the shore" note is kept.
- Mobile: simple stacked grid (no carousel) so 11 items stay scannable.

## 3. New "The process" section (`src/components/sections/ProcessSection.tsx`, new)

- Uses the existing `HOW_WE_WORK` content from `firm.ts` (Consultation, Design, Approvals, Construction — copy already written).
- Claude's layout: eyebrow "The process" + heading "From first visit to final walkthrough" in the standard 3/9 heading grid, then 4 columns, each with a top ink border, small stone numeral (01–04), title, description.
- Placed on the homepage immediately after Services.

## 4. "Registered and accredited" + Areas served (`src/components/sections/AreasServed.tsx`)

- Restyle to Claude's centered band (keeps `section-sand` background):
  - Eyebrow "Registered and accredited"
  - Centered row of uppercase affiliations: **AIA New Jersey · NCARB · LEED AP · Best of Houzz ×9**
  - Centered intro sentence, then the town list in one quiet centered line: Atlantic City · Ocean City · Somers Point · Brigantine · Linwood · Margate City · Marmora · Sea Isle City · Longport · Strathmere
- Replaces the current left-aligned border-top list.

## 5. "The studio" — Claude's head-row + 4:5 portraits (`Index.tsx`, `TeamSection.tsx`)

- Heading block becomes Claude's `head-row`: eyebrow "The studio" + statement "Led personally by both principals." on the left, "Meet the studio →" quiet link aligned to the right (baseline-aligned).
- `PrincipalsGrid` on the homepage renders 4:5 portraits with a `grayscale` filter (as in the draft), name, "role · credentials" line, and bio — left-aligned. The About page keeps its current centered square variant (add an `aspect`/`grayscale` option to `TeamCard` rather than changing the default).

## Resulting homepage order

Hero (untouched) → accreditations line → The practice (centered) → Selected work → Services (11, icons) → The process (new) → Testimonials → The studio (head-row, 4:5) → Registered & accredited / Areas served → dark practice statement → CTA → footer.

## Verification

- Build clean; check `/tmp/observability/build-errors.log`.
- Playwright pass on `/` (desktop 1280px + mobile 390px): confirm centered practice section, 11 service cards with icons, process section, centered affiliations/towns, studio head-row with grayscale 4:5 portraits, hero unchanged.
- Confirm `/services` still renders correctly with the new icon cards.
