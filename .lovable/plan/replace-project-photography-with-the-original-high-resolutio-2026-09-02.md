# Replace project photography with the original high-resolution files

In-place replacement only. Every existing `project_images` row keeps its id, alt text, category, sort order and cover flag. Only the stored file and its path change.

## How each new file is matched to an existing row

Not by folder order — that is guessable and would silently mis-assign photographs. Matching is done by image content:

1. Download every current image of a project from storage (they are the compressed versions of the very same photographs).
2. Compute a perceptual fingerprint (dHash + aHash on a small greyscale version) for each current image and for each original file in the matching folder.
3. Pair them with a best-match assignment (one-to-one, lowest total distance).
4. A pair is accepted only if the distance is clearly below the threshold and clearly better than the second-best candidate. Anything ambiguous is left unmatched and shown to you separately.

This is resolution- and format-independent, so a 6000px TIFF/JPG original still matches its 1400px WebP copy reliably.

You review the result before anything is written.

## Order of work

**Step 1 — 111 Anchor Rd only (16 photographs), review first**

- Match all 16, then produce a review sheet (an HTML page opened in the preview or an image contact sheet) showing, side by side: current image, proposed original, filename, confidence, and the row's category / sort order / cover flag.
- Nothing is written to storage or the database until you confirm.

**Step 2 — after your confirmation**

For each confirmed pair, in this order:

1. Optimise the original: `hero` preset (3200px, q0.88) when the row has `is_cover = true`, otherwise `project` preset (3000px, q0.86). WebP, EXIF stripped.
2. Upload to a **new** path (`<slug>/<category>/<new-uuid>.webp`) so the year-long cache on the old path can never serve a stale file.
3. Update `project_images.storage_path` for that row.
4. Update any `page_media` row whose bucket + path equals the old path, so manually chosen Home / About / Services / Contact slots keep pointing at the same photograph.
5. Re-read both tables and confirm no reference to the old path remains — only then delete the old object from storage.

Each project is processed as one batch and verified before the next starts. If a single file fails, that row is left untouched and reported; the rest continue.

**Step 3 — remaining 11 projects**

Same method, same review step but lighter: a summary per project plus the contact sheet, flagging only low-confidence or unmatched files for your eyes.

## Scope

All 12 projects currently in the database, 162 images total:

111-anchor-rd (16), 115-anchor-road (9), 11605-paradise-drive (16), 122-92nd-street (17), 19-flamingo-road (18), 2200-wesley-avenue (19), 230-e-atlantic-blvd (12), 262-bayshore-road (19), 353-e-surf-road (5), 4607-5th-avenue (12), 5-barbados-road (8), 55-walnut-road (11).

All are published; there are no drafts to catch.

If a folder has more photographs than the project has rows, the extras are **not** imported as new rows in this task — they are listed at the end so you can decide.

## Blocker to resolve first

The SwissTransfer link is not reachable from the build environment — the API returns `403 Access denied` and the download page redirects to `not_found`. This is likely the link's browser/JS-only download flow or an expired transfer.

Options, in order of preference:

1. I retry the download through a real browser session (automated Chromium) — worth one attempt, it often clears the JS gate.
2. You re-share the folder as a direct-download link (Dropbox share link with `?dl=1`, Google Drive, or a plain URL per zip).
3. You upload the archive into the project so I can read it from disk.

## Time, batching and link expiry

- Download of the originals dominates: roughly 10–30 GB depending on file sizes, mostly network time.
- Processing is fast: optimisation plus upload runs around 1–3 seconds per image, so 162 images is well under 15 minutes of actual work.
- To protect against expiry, everything is downloaded **once, up front, in a single pass** into the sandbox before any processing begins. After that the link is no longer needed and can expire freely.
- Nothing is required from you between projects except the one confirmation after 111 Anchor Rd.

## Technical notes

- Fingerprinting and matching run in a Python script in the sandbox (PIL + numpy), not in app code. No project source files change.
- Optimisation for this batch is done server-side with the same parameters as the client presets in `src/lib/images/optimizeImage.ts` (3000/0.86 and 3200/0.88, WebP, no EXIF), since these files never pass through the browser uploader.
- Storage writes use the `project-images` bucket; `deleteStorageObjects` semantics (verify-then-delete) are mirrored so a silently filtered delete cannot leave orphans unreported.
- A per-project JSON log of old path → new path is kept so any step can be audited or reversed.
