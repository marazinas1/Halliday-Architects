# Promote Home V2 and adopt the final minimalist site shell

## Outcome

Home V2 becomes the only public homepage at `/`. The former V1 and V3 concepts, their routes, and every “Home V1 / V2 / V3” selector are removed. The chosen page keeps its photograph-led architecture and is refined to match the supplied `ha-shell.html` reference.

## Homepage

- Promote the current Home V2 composition to the root homepage:
  - full-width photograph
  - split photograph pair
  - second full-width photograph
  - centered “The practice” manifesto
  - three tall Projects / About / Contact tiles with the existing slow hover zoom, dark lower veil, and shifting arrow
- Keep real, client-managed project photography and the existing deliberate photo ordering/fallback behavior.
- Keep the homepage hero and manifesto content connected to the existing homepage settings, including the admin preview route.
- Update homepage SEO to self-reference `/` and retain the real homepage share image.
- Remove temporary concept wording and `/home-v2` assumptions from the promoted implementation and photo helper.

## Navigation

- Replace the temporary homepage-version dropdown with the reference navigation: Projects, About, Services, Contact.
- On the homepage, use a fixed transparent navigation over the photo wall with a legibility scrim and white logo/links; switch it to a solid white, bordered navigation after the photo wall scrolls away.
- Build the reference mobile full-screen drawer with large stacked links, close control, phone, email, and studio address.
- Keep internal pages on the same shared navigation in its solid state, so navigation is visually consistent without placing white links over light page content.
- Preserve correct active links, keyboard access, focus behavior, scroll locking, and 44px mobile tap targets.

## Credentials and footer

- Add the reference credentials band below the homepage tiles using the existing verified firm data:
  - AIA / NCARB / LEED / licensure information from `ACCREDITATIONS`
  - the existing shore service-area content rather than inventing new claims
- Replace the minimal Home V2 footer and align the shared global footer with the supplied four-column layout: brand and description, Studio, Contact, Explore.
- Keep the actual `BrandLogo`, Instagram and Houzz links, firm address, phone, fax, email, copyright, and Admin link.
- Preserve the existing behavior where clicking the footer logo scrolls to the top on Home and returns to Home from another page.

## Cleanup

- Remove the obsolete Home V3 page and the former V1 homepage implementation once Home V2 is promoted.
- Remove `/home-v2` and `/home-v3` routes rather than leaving alternate public versions behind.
- Remove all remaining version labels, dropdown arrays, temporary comments, and concept-only imports.
- Keep `/admin/preview/homepage` pointing at the newly promoted homepage so client edits remain previewable.

## Technical approach

- Refactor the chosen Home V2 into the canonical `Index` page instead of maintaining an alternate duplicate.
- Extend the shared navigation with an explicit homepage-overlay mode and scroll boundary detection; internal pages retain the solid mode.
- Use existing semantic color tokens, Urbanist typography, `BrandLogo`, `FIRM`, settings hooks, project hooks, and route conventions.
- Use CSS/Tailwind transitions matching the reference (approximately 300–700ms), with reduced-motion support; no new backend or schema work.
- Do not copy the uploaded HTML into production or load its external font link—the React implementation will reproduce it through the existing design system.

## Verification

- Confirm `/` renders the selected Home V2 layout with real images and working tile links.
- Confirm the navigation transitions from white-over-photo to solid on scroll and the mobile drawer opens, closes, and navigates correctly.
- Confirm internal pages use the solid shared navigation and the revised shared footer.
- Confirm `/home-v2` and `/home-v3` no longer resolve as homepage variants and there are zero remaining V1/V2/V3 selector references.
- Check desktop and 390px mobile layouts for image framing, readable navigation, footer stacking, focus states, overflow, and layout shift.
- Verify the build and relevant runtime/browser signals are clean.
