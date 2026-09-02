# Admin panel: mobile experience pass

Mobile only. Desktop layouts (md and up) stay byte-for-byte the same - every change is a mobile-first class that gets reset at `sm:`/`md:`.

## What is wrong today

1. **Page headings squeeze into a narrow column.** Services, Home, About, Contact, Projects headers use a side-by-side row (`flex items-start justify-between` / a two-column grid) with the action buttons on the right. On a phone the buttons keep their width and the title plus description are forced into a ~130px column, so text runs one or two words per line.
2. **The photograph picker cannot be scrolled on a phone.** In the "From projects" tab the right-hand pane is a two-row grid (`grid-rows-[auto_minmax(0,1fr)]`) but on mobile it holds three children: the project select, the caption row, and the image grid. The third child falls outside the sized rows, so the scroll area has no bounded height and the thumbnails below the fold are unreachable.
3. **Picker chrome eats the small screen.** The tab strip, project select, and caption line take roughly a third of the dialog height before a single photograph appears.
4. **Row lists are cramped.** Services, Team, Blog rows put thumbnail, title, two arrows, Edit and Delete on one line, so titles truncate to "Ne…" and the tap targets sit under 40px.
5. **Photograph slot controls wrap awkwardly.** The developer row and the Change / clear buttons in a page image slot collide on narrow screens.
6. **Project filter bar** stacks four full-width selects, pushing the list far down the page.
7. **Data tables** (Projects list view, Blog, Team) rely on horizontal scroll with no affordance.

## What will change

**Shared header pattern.** Introduce one mobile-first admin header layout: title and description full width, action buttons on their own row beneath, becoming the current side-by-side row at `sm:`. Applied to Services, Home, About, Contact, Photographs, Projects, Blog, Team, Testimonials, Tags, Users, Inquiries.

**Image picker, mobile.**
- Correct the row structure so the scroll container always receives a bounded height; thumbnails scroll properly at every width.
- Move the project select and caption into a single compact sticky bar; drop the "click one to use it" wording on mobile.
- Larger tap targets and two columns of thumbnails with the category chip kept legible.
- Keep the dialog at full viewport on phones, with a header that does not scroll away.

**Row lists.** Services, Team, Blog, Testimonials rows become a two-line card on mobile: thumbnail and title on the first line, actions on a second row with 44px targets. Unchanged from `sm:` up.

**Photograph slots.** Buttons go full width in a stacked group on mobile; the developer row wraps cleanly under its own label.

**Projects screen.** Search stays visible; the three selects and the view toggle collapse into a single "Filters" sheet on mobile with the active-filter count shown on the button. The list view falls back to the existing card grid on phones instead of a horizontally scrolling table.

**Tables elsewhere** (Blog, Team) get the same card-on-mobile treatment rather than horizontal scroll.

**Forms.** Project, blog, and team forms: confirm no field pair collapses badly, set `text-base` on inputs where iOS would otherwise zoom, and make sticky save bars full width on mobile.

**Editor toolbar.** The rich text toolbar becomes a horizontally scrollable strip with no wrap, so the writing area stays visible.

## Technical notes

- New shared component `src/components/admin/AdminPageHeader.tsx` taking `title`, `description`, and `actions`; existing headers replaced with it.
- `ImagePicker.tsx`: restructure the right-hand pane to `grid-rows-[auto_minmax(0,1fr)]` with the select and caption inside one header row, so the scroll region is the only flexible row. Remove `min-h-full` from the thumbnail grid, which currently fights the scroll container.
- `PageImageSlot.tsx` and `AdminServices.tsx`: stack controls with `flex-col sm:flex-row`.
- Projects filters: reuse the existing shadcn `Sheet`; no state or query changes.
- No database, hook, or query changes anywhere in this work.

## Verification

Playwright at 390x844 for each admin screen: headers read across the full width, the picker scrolls to the last photograph in a project, service rows show full titles, and the projects filter sheet opens and applies. Desktop screenshots at 1440px compared against current output to confirm nothing shifted.
