# Services page redesign

## Verified finding

- The live `/services` page renders all six service titles and all six icon components, including **Restoration** and **Kitchens & interiors**.
- All six entries use the same `SERVICE_GROUPS.map(...)` branch and the same `Reveal` wrapper, with no conditional that removes only those headings or icons.
- The screenshot issue is therefore not a persistent content/code defect; it is consistent with a capture during the scroll-reveal lifecycle. The redesign removes the icon treatment entirely, so that visual symptom will no longer apply.

## Implementation

1. **Replace the Services hero only**
   - Stop using `PageHero` in `ServicesPage.tsx`; leave the shared component untouched for Contact.
   - Add the same centered white page heading pattern used by Projects, with “What we do”, “Services”, and the existing introductory sentence in one compact header block.

2. **Build six alternating service bands**
   - Keep `SERVICE_GROUPS` in `firm.ts` byte-for-byte unchanged.
   - Fetch published project covers with the existing `usePublicProjects()` hook and pair them by current display order, one cover per service.
   - Render each service as a full-width, fixed-height desktop band: image and copy side by side, alternating left/right by row.
   - Alternate the copy panels between existing sand and background tokens; remove icon circles, rounded corners, and shadows.
   - Preserve every service title, body paragraph, and keyword line exactly as currently stored.
   - Use existing `rhythm.ts` containers/gutters inside the text panels; introduce no new container widths.

3. **Handle loading and missing photography safely**
   - Give every real image its resolved project-cover alt text, explicit `width`/`height`, lazy loading, and async decoding.
   - Keep the band geometry stable while project covers load.
   - After loading, if a service has no corresponding published cover, omit the media column and let its copy panel span the full band width—never show an empty image slot.

4. **Mobile behavior**
   - Stack every photographed band consistently as image first, copy second, regardless of desktop alternation.
   - Let image-free services remain text-only and full width.
   - Preserve readable spacing and fixed media proportions without rounded styling.

5. **Preserve surrounding scope**
   - Keep the existing Services SEO, CTA section, and global footer unchanged.
   - Do not modify Home, Projects, project detail, About, Blog, Contact, admin, database schema, dependencies, or shared content.

## Verification

- Check `/services` at desktop and phone widths for all six headings, descriptions, and keyword rows.
- Confirm covers follow published-project order and missing covers collapse to full-width text.
- Confirm desktop alternation, consistent mobile image-first stacking, no layout overlap, and no rounded corners/shadows.
- Confirm image alt text and dimensions are present, CTA/footer remain unchanged, and the project build has no errors.
