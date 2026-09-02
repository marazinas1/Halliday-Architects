# Unify "Automatic" and "Default" badges into one word: Default

Two different stickers ("Automatic" and "Default") describe the same thing to an owner or editor: a photograph they did not personally choose. Only the developer layer distinguishes them, and that distinction does not need a separate label.

## What changes

- Any slot that is not personally chosen shows a single badge: **Default**. The "Automatic" badge disappears everywhere in the admin panel.
- The helper line under a slot stays informative without the second word: pinned defaults read "Default photograph - shown on the site now"; project-sourced ones read "From <project title> - shown on the site now".
- Slot with an owner/editor choice keeps the dark **Chosen** badge, unchanged.
- Services list thumbnails: the small "Automatic" strip becomes "Default".
- The Home admin intro paragraph is reworded to reference "Default" instead of "Automatic".
- Developer behaviour is untouched: the developer-only panel for pinning or clearing a default keeps working exactly as it does now, it just no longer produces a differently worded badge.

## Technical notes

- `src/components/admin/PageImageSlot.tsx`: the `badge` expression maps both `default` and `automatic` sources to the string `Default`; badge styling logic unchanged (dark for chosen, light for the rest). Helper texts adjusted; `source` values themselves remain intact so resolution logic and the developer default panel are unaffected.
- `src/pages/admin/AdminServices.tsx`: fallback overlay label text changed to `Default`.
- `src/pages/admin/AdminHome.tsx`: intro copy updated.
- No database, hook, or public-site changes; `useResolvedPageImages` keeps its three-tier resolution.
