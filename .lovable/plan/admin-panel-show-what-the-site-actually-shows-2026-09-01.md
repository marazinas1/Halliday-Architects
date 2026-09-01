# Admin panel: show what the site actually shows

Right now the public pages resolve their own fallbacks (project photography) while the admin screens only know about explicitly chosen images. So the site looks full and the admin looks empty. This plan makes the admin the single source of truth for everything visible, and fixes the tabs, the picker and the missing testimonials section.

## 1. One shared photo resolver

Move the fallback logic that currently lives inside `Index.tsx`, `AboutPage.tsx`, `ContactPage.tsx` and `ServicesPage.tsx` into a single hook (`useResolvedPageImages`) built on the existing concept-photo helpers.

Both the public page and the admin screen call it, so the admin preview panel is byte-for-byte the photograph the visitor sees. Each slot in the admin then shows one of two states:

- "Chosen" — the client picked it, with Change / Remove.
- "Automatic" — the photograph currently pulled from project photography, shown as a real thumbnail with a small "Automatic — from <project>" caption and a "Choose your own" action.

Applies to: Home (4 wall photographs + 3 tiles), About (2 strip photographs), Contact (hero photograph), Services (band photographs).

## 2. Audit: everything visible becomes editable

Sweep every public page and pull remaining hardcoded copy into `page_text` so it appears in the admin:

- Home: statement (exists), tile labels/captions.
- About: intro prose paragraphs (currently hardcoded in `AboutSection.tsx`), "How we work" step text, Partners section heading.
- Services: page heading and intro.
- Contact: heading and intro (already editable) plus the map band caption.
- Anything genuinely fixed (firm name, phone, address) stays in `src/content/firm.ts` and is surfaced read-only under Settings so nobody hunts for it.

Each admin field keeps its live wording as grey placeholder, so "empty" always means "the wording you see on the site".

## 3. About: real tabs, not page jumps

`SectionTabs` currently links to separate routes (`/admin/team`, `/admin/testimonials`), which is why clicking Team leaves the page. Rework About into one screen with in-page tabs (About page / Team / Testimonials) that swap panels without navigating. The old routes stay as redirects into the right tab so bookmarks keep working, and the sidebar keeps a single "About" entry.

## 4. Testimonials go back on the public About page

Add a testimonials section to `/about`, placed directly before Trusted partners, using the site's existing quiet editorial styling (centred quote, thin rule, name and detail — no cards, no stars unless already used elsewhere). It reads published quotes from the database, so the Testimonials tab in the admin controls it. If nothing is published, the section renders nothing.

## 5. Photo picker that reads clearly

Rework the picker dialog shown from every "Choose" button:

- Constrain the dialog to a sensible width with its own scroll area, so the grid never bleeds off screen as in the screenshot.
- Keep the project tab strip, but add the active project's name and image count above the grid.
- Larger thumbnails on a calmer grid (2/3/4 columns), each with a hover caption showing its category (hero / card / gallery) and alt text.
- Clear selected state, an obvious "Use this photograph" confirmation, and the Upload tab as a proper dropzone matching the rest of the admin.

## 6. Services parity

Service bands currently show no thumbnail in the list. Show the resolved photograph (chosen or automatic) in both the list rows and the edit drawer, with the same Chosen/Automatic treatment as everywhere else.

## Technical notes

- New: `src/hooks/useResolvedPageImages.ts` (shared slot → photograph resolution), a `Testimonials` block reused on `/about`.
- Changed: `PageImageSlot` (uses `fallbackUrl`, adds source caption), `ImagePicker` (layout, captions, scroll), `SectionTabs` (controlled in-page tabs), `AdminHome`, `AdminAbout`, `AdminContact`, `AdminServices`, and the four public pages to consume the shared resolver.
- New `page_text` rows only; no schema change needed beyond seeding current wording into `page_text` so the admin shows real values rather than placeholders.
- Verification: log into the admin and confirm each slot on Home, About, Services and Contact shows the same photograph as the live page in a side-by-side check.
