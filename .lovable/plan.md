## Goal
Replace the current generic "HL" serif monogram favicon with the actual HL mark from the Halliday-Leonard General Contractors logo.

## Source
`src/assets/halliday-leonard-logo.png` contains a distinctive dark-red architectural "HL" monogram on the left side, before the wordmark.

## Steps
1. Crop the square HL mark region out of the logo PNG (left ~18% of the image), trim whitespace, and pad it to a square canvas with a small margin so it stays legible at 16px.
2. Generate three icon files from that crop, on a transparent background:
   - `public/favicon-32.png` (32x32)
   - `public/favicon-16.png` (16x16)
   - `public/apple-touch-icon.png` (180x180, on a solid light background so it doesn't disappear on iOS)
3. Leave `index.html` unchanged — it already references those three files.
4. Verify with a browser screenshot of the tab icon / direct file check.

## Technical detail
Cropping and resizing done via ImageMagick/PIL in the sandbox from the existing asset — no image generation, so the mark matches the brand exactly. Browsers cache favicons aggressively, so a hard refresh may be needed to see the change.
