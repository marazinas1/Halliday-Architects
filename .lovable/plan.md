# Consolidate About and Team into one minimalist page

## Goal
Bring About into the same restrained, image-led visual system as Home and Projects, while retiring the redundant public Team page. Keep all public people data dynamic from the existing team administration flow and leave every excluded page untouched.

## Public About page
- Replace the current black `PageHero` with a centered white page heading matching the Projects-page language:
  - eyebrow: “The practice”
  - single H1: “Residential architecture in Ocean City, New Jersey”
- Keep the three existing factual introduction paragraphs and the shared “What we do” link.
- Add an edge-to-edge, two-image photographic strip using the first available published project cover images from the existing `usePublicProjects` hook and current ordering. Use stable responsive heights, proper alt text, lazy loading, and clean fallbacks if fewer than two images exist.
- Reuse `ProcessSection` for “How we work” and its four existing steps.
- Build one sand-background `#studio` section with navigation-safe `scroll-margin-top`:
  - “The studio” / “Led by the principals”
  - principal cards with 4:5 portraits, credentials, and full biographies
  - “Working alongside them” plus non-principal staff only when such staff exist
- Render both groups as centered wrapping flex rows rather than fixed grids, so every member count remains centered with no empty slots.
- Keep one unified person-card shape for principals and staff. Hide absent photos, credentials, or biographies cleanly without empty rules or spacing artifacts; use an initials portrait fallback when needed.
- Keep the existing two static collaborators, restyle their logos as borderless, muted grayscale images that return to color on hover, and render the entire section only when the partner list is non-empty.
- Keep the existing shared CTA and global footer, preserving the accreditation strip already built into the footer.

## Team route and navigation
- Remove `TeamPage.tsx` and its lazy import.
- Preserve old inbound links with a client-side redirect from `/team` to `/about`.
- Remove “Meet the full studio” from About.
- Keep “Our Team” in the footer, but point it to `/about#studio`.
- Make hash navigation reliably scroll the studio heading below the sticky navigation, including when arriving from another page.
- Remove `/team` from generated and static sitemap entries, and update the machine-readable site page list so the team is represented under About rather than as a standalone page.

## SEO
- Update About’s title and description to include Christopher Halliday and Shannon Halliday while keeping the title under the recommended length and the description concise.
- Retain one semantic H1 and use section headings for the remaining hierarchy.

## Admin and preview
- Leave `/admin/team`, its CRUD behavior, storage pipeline, ordering, publishing controls, and queries unchanged.
- Add one short line to the Team admin screen explaining that published team members appear on the About page.
- Update team-member preview wording and layout so an unsaved member is shown in the same white heading plus sand studio context and the same 4:5 person card used on the real About page, without `PageHero` or the black band.

## Component work
- Refactor `TeamSection.tsx` around reusable, dynamic person-card and centered-roster components rather than separate fixed-grid variants.
- Preserve compatibility for any homepage usage of the principals component; do not alter homepage output.
- Refine `PartnersSection.tsx` only for the requested heading robustness, conditional rendering, and logo treatment.
- Compose the new sequence in `AboutPage.tsx` using existing tokens, `container.content`, `container.people`, `sectionPadding`, `Reveal`, `SectionLink`, and Tailwind utilities.

## Constraints
- No database migrations, query-shape changes, new dependencies, hard-coded people, or edits to Home, Projects, project detail, Services, Blog, or Contact.
- No rounded corners or shadows in the public About/Studio treatment.
- Do not copy the reference HTML/CSS or its placeholder logo; retain `BrandLogo` through the existing global shell.
- Partners remain the existing two static partner entries for this scope.

## Verification
- Add focused tests where useful for conditional roster grouping/rendering behavior.
- Verify `/about`, direct `/team` redirect, footer `#studio` navigation, and `/admin/preview/team` at desktop and mobile sizes.
- Confirm 4:5 portraits, centered wrapping for varying member counts, conditional staff/partner sections, no clipped collaborator heading, no horizontal overflow, and no empty visual slots.
- Run the relevant tests and confirm the preview build is clean.
