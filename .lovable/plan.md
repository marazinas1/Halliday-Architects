# Where the SSR migration stands, and what is left

## Short answer

The migration itself is done. Phase 1 (framework swap) and Phase 2 (server-side data, page by page) both finished: home, projects, project detail, about, services, contact and journal all send real content in the first HTML response.

Chris's and Shannon's accounts are untouched. Both still exist as owners with their original credentials — the migration only changed how pages render, never the backend, users or roles. Nothing needs re-inviting.

## What is genuinely still open

### 1. Per-page SEO metadata is not server-rendered (the one real gap)

Each page still sets its title and description through `SEO.tsx` (react-helmet-async), which only runs in the browser after JavaScript loads. So the page a crawler or a link preview sees carries the site-wide title from the root, not the page's own.

This is the exact problem SSR was meant to solve, and it is the last piece still running the old way. Fix: move each page's title/description/OG tags into the route's own `head()`, including the dynamic project and journal routes which take their title from the loaded record. Then remove the helmet layer.

### 2. Admin pages stay client-rendered — by design

Admin is behind a login; there is no SEO or first-paint case for server rendering it. It works as before. No action, just confirming it is intentional and not an oversight.

### 3. Boot prefetch is now mostly redundant

`prefetchBootData()` still fires after hydration but skips anything the server already sent, so on the converted pages it does nothing. Harmless today; worth deleting later once every page is confirmed loader-fed. Not a blocker.

### 4. Launch items unrelated to SSR (still on the pre-existing checklist)

- `noindex` in the root head and the blocking `robots.txt` remain in place for the preview domain — correct for now, must be lifted at go-live.
- The email sending domain is still unverified, so inquiry notifications do not deliver.
- The test blog post still needs removing before handover.

## Recommended next step

Do item 1 before you publish. It is a contained change — one `head()` per route — and publishing without it means the shared-link preview and search result for every page reads the same generic homepage title, which undercuts the reason for the migration.

Items 3 and 4 can follow after you and the client have looked at the preview.

## Suggested order

1. Move page metadata into route `head()` and retire `SEO.tsx` / helmet.
2. You review the preview yourself.
3. Publish.
4. Later, separately: remove `prefetchBootData`, then work the launch checklist.
