# Picker clarity, automatic-photo control, and sharper photography

## Answers first

**Where do the photographs live?** In the projects module. Each project owns its photographs in `project_images` (managed on the project edit screen), and the picker reads them through the project image library. There is no separate media library today.

**What happens to a photograph I upload in the picker?** It does *not* join a project. It goes into the `site-images` bucket under `homepage/`, and is referenced only by the slot you uploaded it into. So it is invisible everywhere else — no way to reuse it, no way to clean it up. That is a gap worth closing (see part 3).

**Where is the "automatic" assignment decided?** In code, not in the database — a shared resolver picks a project photograph per slot, using a fixed order of five leading projects for the homepage, the last two projects for the About strip, and one project per Services band. Nobody can change it from the admin panel right now.

**How are uploads compressed?** Every admin upload runs through one shared pipeline: resize to the preset's longest edge, convert to WebP, strip EXIF. Current presets: project photography 2400px / ~1MB / quality 0.82, homepage hero 2560px / ~1.2MB. That 0.82 quality on a wide full-bleed image is what you are seeing as "not sharp" on a Retina screen — a 2400px file shown across a 1470pt Retina viewport is being asked for roughly 2940 real pixels.

## 1. Picker: make the project strip readable

- Give the dialog a proper height and a wider max width, with the project strip pinned above its own scroll area.
- Replace the thin scrolling tab strip with a visible **project list** — a left column inside the dialog on desktop (name + photograph count), and a full-width dropdown/select on narrow screens. Nothing gets hidden under a scrollbar.
- Keep the search field, filtering that list.
- Selected project name and count stay above the grid.

## 2. Who controls the automatic photographs

Introduce an admin screen, **Website → Automatic photography**, visible only to the platform owner role (your account) — hidden from owners and editors. It lists every slot on Home, About, Services and Contact and lets you set which project each slot draws from when nobody has chosen a photograph. Stored in a small settings table so the resolver reads it instead of hardcoded slugs; where nothing is set, the current code order remains the default.

I would not add a separate `developer` role — the existing `platform_owner` role already means exactly "you, not the client", and adding a fourth role means auditing every policy again. Say the word if you want a real `developer` role instead.

## 3. Uploaded (non-project) photographs get a home

Add **Website → Photograph library**: everything uploaded through a picker, listed with its thumbnail, upload date and which slots use it, with delete for unused files. The picker gains a third tab, "Uploaded", so a photograph uploaded once can be reused on another page instead of being uploaded again.

## 4. Sharper photography without a slow site

Raise the presets and serve the right size per screen:

| Preset | Now | Proposed |
|---|---|---|
| Project photography | 2400px, q0.82, ~1MB | 3000px, q0.86, ~1.6MB |
| Homepage hero / full-bleed | 2560px, q0.82, ~1.2MB | 3200px, q0.88, ~2.2MB |
| Blog cover | 1800px, q0.82 | 2000px, q0.86 |
| Headshots, body, logos | unchanged | unchanged |

Bigger source files alone would slow the site, so they are paired with:

- **Responsive delivery** — request 800/1200/1600/2400/3200px variants from storage image transformation and hand the browser a `srcset` + `sizes`, so a phone downloads ~200KB and a 5K display gets the full file. If transformation is not available on the current plan, the fallback is generating two sizes at upload time (full + 1400px) and using those in the `srcset`.
- Explicit `width`/`height` on every image (no layout shift), `fetchpriority="high"` + preload on the one hero image, lazy loading everywhere below the fold.

**The standard to hold:** LCP under 2.5s on a mid-range phone, hero image over the wire under ~400KB after responsive selection, full homepage under ~2MB. Architecture and photography sites (BIG, Snøhetta, Dezeen) all run 2× density source files with responsive `srcset` — the sharpness comes from serving the right variant, not from sending one huge file to everyone.

Existing photographs stay as they are; they were already encoded at the old settings. If you want them re-done at the new quality, that is a separate re-upload pass from the originals — tell me and I will script it.

## Technical notes

- `ImagePicker` restructured (project list column + dropdown, uploaded tab); `DialogContent` sized with its own scroll region.
- New table for slot → project defaults, admin-gated to `is_platform_owner()`; `useResolvedPageImages` reads it with the current hardcoded order as fallback.
- New admin route `/admin/automatic-photography` and `/admin/photograph-library`, both behind a platform-owner guard in the sidebar and the route.
- `IMAGE_PRESETS` values updated; new `ResponsiveImage` component centralising `srcset`/`sizes`/dimensions, adopted on Home, Projects, About, Services and Blog.
- Verification: side-by-side of a homepage photograph before/after at 2× zoom, plus a network check that the mobile viewport pulls the small variant.
