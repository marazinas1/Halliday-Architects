# Rhythmic project grid

## Goal
Replace only the project-card arrangement on `/projects` with full-width rows that follow the repeating `1, 2, 3, 2` rhythm, always consume every visible project, and never leave an empty grid cell.

## Implementation

1. **Create a pure row-sizing helper**
   - Add a small standalone utility that accepts a non-negative project count and returns an array of row sizes.
   - Consume the repeating sequence `1, 2, 3, 2` while enough projects remain for the next complete row.
   - Put any remainder of one or two projects into the final row.
   - If that would produce two consecutive one-card rows at the end, merge them into one two-card row.
   - Return `[]` for `0` and preserve the exact expected outputs supplied for counts `1–12`.

2. **Render projects as explicit rows**
   - In `ProjectsPage`, recompute row sizes from `filtered.length`, then slice the already ordered filtered array into those rows without changing queries, ordering, or filter behavior.
   - Make every row use the available container width (`w-full`, never `100vw`) and divide it into one, two, or three equal columns, avoiding horizontal overflow from the browser scrollbar.
   - Keep the existing card markup and appearance unchanged: image, cover behavior, gradient, white title, metadata, hover treatment, accessibility, and project link.
   - Preserve the existing `2px` horizontal and vertical gutters.

3. **Apply the requested row heights and breakpoints**
   - Desktop one-card row: `66vh`, minimum `460px`.
   - Desktop two-card row: `54vh`, minimum `380px`.
   - Desktop three-card row: `42vh`, minimum `300px`.
   - Below `1024px`, split a three-card row into three full-width rows so no cells remain empty; each resulting single-card row uses `54vh` with a `380px` minimum height rather than retaining the desktop three-card-row height.
   - Below `820px`, render every project as a single full-width row at `46vh`, minimum `280px`.
   - Keep every image `object-cover` and every card in a row equal in height.

4. **Add focused automated coverage**
   - Add Vitest tests for `0`, all specified examples from `1–12`, and additional larger counts.
   - Assert that every result sums to the input count, contains only row sizes `1–3`, follows the cycle until the final remainder, and never ends with consecutive one-card rows.

5. **Verify the rendered result**
   - Confirm tests and build diagnostics pass.
   - Check `/projects` at desktop, below `1024px`, and below `820px`, including a filtered result set, to verify full-width occupancy, exact gutters, responsive row splitting, and unchanged card/filter styling.

## Scope safeguards
- No changes to filters, data fetching, project order, page header, closing band, accreditations, footer, homepage, project detail pages, admin, or database.
- No new dependencies.
