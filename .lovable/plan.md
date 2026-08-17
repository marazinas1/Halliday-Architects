# Rebrand pass: Halliday Leonard → Halliday Architects

Content and naming only. No styling, layout, or design changes.

## 1. Firm content module

Rename `src/content/hallidayLeonard.ts` to `src/content/firm.ts` (the path AGENTS.md already names) and update every import.

New `FIRM` constant:

- name / shortName: Halliday Architects
- phone: 609.957.6789 (`tel:6099576789`)
- fax: 609.337.1758
- email: chris@hallidayarchitects.com
- address: 728 West Avenue, Suite A, Ocean City, NJ 08226
- tagline: neutral placeholder, real copy later

`TEAM` replaced with the real team, bios left empty:
Chris Halliday (Principal, RA LEED AP), Shannon Halliday (Principal, RA LEED AP), Brett Hagerty (Draftsman), Christy Hill (Studio Designer), Samantha Cozzi (Studio Designer).

The duplicate hardcoded team in `src/components/sections/TeamSection.tsx` will read from `firm.ts` instead, so there is one source of truth.

## 2. Branding strings

- `index.html`: title, description, author, og/twitter tags, JSON-LD (Organization / ArchitecturalService with the new contact details), remove the `hallidayleonardinc.com` URLs and the og-image pointing at them.
- `src/components/SEO.tsx`: `SITE` becomes `https://halliday-architects.lovable.app` until cutover to hallidayarchitects.com.
- `GlobalNav.tsx`, `GlobalFooter.tsx`, `AdminShell.tsx`: firm name, alt text, aria-label, footer address/phone/email, copyright.
- Page-level SEO titles and descriptions on Index, About, Team, Services, Projects, Project, Testimonials, Contact.
- `ContactSection.tsx`: address, phone, email, error toast, map title, lead `source` string.
- `AboutSection.tsx` and `Index.tsx` copy lines that name the contractor.

## 3. Inherited testimonials

`TESTIMONIALS` are client letters written about the contractor and name Keith/Scott Halliday-Leonard. They cannot be kept for an architecture practice. Proposal: empty the array and leave the type in place, so the testimonials page renders an empty state until real content arrives. Say the word if you would rather remove the route entirely.

## 4. Logo assets

`halliday-leonard-logo.png` / `-white.png` are the contractor's marks and are imported by nav and footer. `src/assets/halliday-logo.png` already exists in the repo. Plan: point nav and footer at a copy named `halliday-architects-logo*.png`. If the existing `halliday-logo.png` is the correct Halliday Architects mark, that gets used; otherwise the old file is copied under the new name as a placeholder and swapped once the real logo is supplied.

## 5. Out of this task's scope

`public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`, `scripts/generate-sitemap.ts`, and the two edge functions (`sitemap`, `send-transactional-email` + email template) also carry old branding and domains. They sit outside `src` and `index.html`. I will update them in the same pass unless you want them held back — the email sender domain still needs a verified domain at go-live either way.

## Verification

- `rg -i "halliday[- ]?leonard|hallidayLeonard|HallidayLeonardInc" src index.html` returns zero matches
- Typecheck and build pass
- Homepage, /team, and /contact render with no console errors (checked in a headless browser)
