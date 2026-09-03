# Standardize project photography to 4:3

## Goal

Present the houses with substantially less cropping and a calmer, professional architectural-portfolio rhythm. All preview frames use one predictable 4:3 landscape ratio; opening a photograph shows its original aspect ratio without cropping.

## Projects archive (`/projects`)

- Replace the current viewport-height card sizing with `aspect-ratio: 4 / 3` for every project card.
- Keep the existing 1–2–3–2 row rhythm, filters, overlays, titles, hover treatment, and project links.
- Keep `object-cover` inside the 4:3 frame so the wall remains aligned, but the wider shape will retain much more of each house than the current tall frames.
- Update declared image dimensions and responsive `sizes` to match the real 4:3 slots, preserving sharp Retina delivery without downloading unnecessarily large files.

## Individual project pages (`/projects/$slug`)

- Change the main project hero from an 82vh crop to a responsive 4:3 frame, retaining the existing title and metadata overlay.
- Replace the current mixed 56–72vh gallery rows with a consistent 4:3 gallery: one column on mobile and two columns on desktop, with the existing narrow separators and reveal motion.
- Make the hero and every gallery photograph open the lightbox.
- Include the hero in the same lightbox sequence as the gallery and preserve keyboard/arrow navigation.
- Keep the lightbox’s current `object-contain` behavior so each opened photograph is shown at its original aspect ratio with no cropping, up to the existing high-resolution 3000px delivery.
- Change the “Next project” photograph to 4:3 as well so every project preview follows the same standard.

## Quality and scope

- No database, uploaded master, image assignment, ordering, alt text, SSR loader, filtering logic, or admin behavior changes.
- No image re-encoding is needed; only presentation and responsive delivery declarations change.
- Preserve the existing design system, typography, navigation, footer, gradients, and motion.

## Verification

- Check `/projects` at desktop and mobile widths: every card is 4:3, row rhythm remains 1–2–3–2, text does not overlap, and houses are visibly less cropped.
- Check at least two project pages containing differently shaped source photographs: hero/gallery frames remain aligned and no layout shifts occur.
- Open the hero and several gallery images; confirm the lightbox shows the full original proportions and that mouse, keyboard, close, previous, and next controls work.
- Confirm responsive image requests remain sharp on a 2x display and that SSR HTML, console, and build remain clean.
