# Match project galleries to the Projects archive rhythm

## Layout

- Reuse the existing `getProjectRowSizes()` helper inside every individual project page, so gallery photographs follow the same repeating **1–2–3–2** rhythm as `/projects`.
- Let the final row adapt to however many photographs remain, exactly as the Projects archive already does; no empty cells.
- Use the same responsive columns as the archive:
  - mobile: one photograph per row for comfortable viewing;
  - desktop: the intended 1-, 2-, or 3-photo row.
- Keep every photograph in the newly approved 4:3 frame, so the varied rhythm does not reintroduce tall or heavily cropped images.
- Keep the exact `2px` horizontal and vertical gap between photographs and rows.

## Behavior and quality

- Preserve the current gallery order, reveal animation, hover treatment, alt text, responsive sharpness, and click-to-open behavior.
- Preserve the hero as its own 4:3 introduction above the project text; the 1–2–3–2 rhythm applies to the gallery below.
- Preserve the lightbox sequence with the hero first, followed by all gallery photographs at their original uncropped proportions.
- No database, admin, image assignment, SSR loader, or Projects archive changes.

## Verification

- Check projects with several different photograph counts and confirm the rendered row sequence follows 1–2–3–2 repeatedly, with the final row adapting correctly.
- Confirm all desktop gallery frames remain 4:3 with precisely 2px gaps.
- Confirm mobile remains one column with 2px vertical gaps and no overflow.
- Open photographs from single-, double-, and triple-photo rows and verify lightbox indexing, arrows, keyboard navigation, and original proportions remain correct.
- Confirm the build and browser console remain clean.
