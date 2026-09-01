# Align Projects with the minimalist homepage

## Outcome

The Projects index and individual project pages will use the same photograph-led, edge-to-edge visual language as the chosen homepage, following the supplied `ha-projects.html` reference while continuing to render all project content and images from the admin-managed database.

## Two preliminary corrections

- Make every public-facing Halliday Architects logo behave consistently:
  - on `/`, clicking it smoothly returns to the top even though the route does not change
  - on any other page, clicking it navigates to `/`, where the existing route scroll reset opens the homepage at the top
  - apply this to both the shared navigation and footer logo, including the mobile menu logo
- Remove Houzz from the footer social system completely by deleting its social entry and custom icon implementation; Instagram remains the only footer social icon/link. This does not remove factual Houzz-derived awards or source copy elsewhere on the site.

## Projects index

- Replace the current separated card grid with the reference’s continuous full-width photo wall and 2px gutters.
- Add a centered, restrained page introduction: “Selected work”, “Projects”, and the existing factual residential-architecture description.
- Restyle project filters as minimal text tabs rather than outlined chips, preserving:
  - project-type and detail-tag filtering
  - hiding rows that offer no meaningful choice
  - horizontal usability on phones
  - a clear reset state when filters are active
- Render each project cover as a large 4:3 image with a permanent lower gradient, white project title, and concise location/type metadata.
- Use a slow, subtle image zoom on hover; preserve keyboard focus states and direct links to project pages.
- Let an unpaired final card span the full grid width on desktop, as shown in the reference, without producing empty space.
- Replace the existing large CTA treatment with the reference’s slim sand closing band leading to Contact, then retain the shared credentials/footer shell.
- Keep loading, no-project, and no-match states visually compatible with the new composition.

## Individual project page

- Rebuild the hero as a large photographic field with a dark lower veil and white overlaid content: Back to projects, type/year, title, location, and optional tagline.
- Keep the project hero eager-loaded with high fetch priority and its resolved admin alt text.
- Center the brief and story on a readable measure, showing only content that exists.
- Convert the gallery into a continuous 2px-gutter wall cycling through full-width, equal-pair, asymmetric split, and full-width rows. Handle any image count cleanly without blank cells or orphaned white areas.
- Keep gallery images lazy-loaded, dimensioned, described with existing resolved alt text, and clickable into the accessible lightbox.
- Render the sand Details / Features band only when at least one side has content; omit each empty column independently and use a single-column layout when only one exists.
- Turn “Next project” into a photographic closing panel using the next published project’s cover, dark veil, title, and link. Extend the existing public project data query as needed without changing database structure or admin workflows.
- Preserve project previews, SEO/share images, published-project ordering, and all current admin-managed fields.

## Technical details

- Primary frontend files: `GlobalNav.tsx`, `GlobalFooter.tsx`, `SocialLinks.tsx`, `firm.ts`, `ProjectsPage.tsx`, `ProjectFilters.tsx`, `ProjectPage.tsx`, and `usePublicProjects.ts`.
- Reuse the current semantic palette, Urbanist typography, shared rhythm, `BrandLogo`, `Lightbox`, `Reveal`, project/tag hooks, and shared footer.
- Use semantic design tokens only; the uploaded HTML is a visual specification, not production source.
- No database migration, content invention, or admin-panel redesign is required.

## Verification

- Verify navigation, footer, and mobile-menu logo clicks from the homepage and an internal page.
- Confirm the footer shows Instagram only and contains no Houzz icon or Houzz URL.
- Test project type/tag filtering, reset behavior, odd/even project counts, loading, and empty results.
- Open projects with short, long, and incomplete content to confirm hero readability, gallery row composition, conditional detail columns, lightbox navigation, and next-project looping.
- Check desktop and 390px mobile layouts for image crops, text overlap, focus states, overflow, and stable image space.
- Confirm admin project preview still matches the public project design and verify build/runtime signals are clean.
