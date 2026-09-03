# Phase 2, step 1: server-render the homepage photographs

## Answer to your question first

Yes — this is exactly what changes.

Today `prefetchBootData()` runs in an effect after hydration, so the request for the photo URLs still starts in the browser. Structure paints instantly, images arrive later. It removed the hydration mismatch but it did not remove the wait.

After this step, the homepage's data is fetched **on the server, before the HTML is sent**. The HTML the browser receives already contains the real `<img>` tags with the hero URL, so the image download starts during HTML parsing — before React even loads. No grey cards on refresh, and the hero can be discovered by the browser's preload scanner.

## What gets done

1. **Add the query/SSR bridge.** Install `@tanstack/react-router-ssr-query` and wire it in `src/router.tsx` so anything a loader puts in the query cache on the server is serialised into the HTML and picked up by the client cache on hydration. This is the missing piece — without it a loader would fetch on the server and then fetch again in the browser.

2. **Give `/` a loader.** `src/routes/index.tsx` gains a loader that calls `ensureQueryData` for the two queries the homepage depends on: page content (`page-content`) and published projects (`public-projects`). Both run in parallel. Component code, hooks and `useResolvedPageImages` stay untouched — they read from the same cache, which is now already warm on first render.

3. **Stop double-fetching at boot.** Once the loader supplies the data, the post-hydration `prefetchBootData()` becomes redundant for `/`. It stays for the other pages (they are handled in later steps) but is made a no-op when the cache already holds fresh entries, so the homepage does not re-request on load.

4. **Keep the hero eager.** The hero keeps `fetchPriority="high"` and eager loading; now it is present in the server HTML, so that priority actually applies from the first byte.

## Risk and how it is contained

- The Supabase client must run during SSR. It is a plain `fetch`-based client with the publishable key, so it works in the server runtime; the loader only reads public, RLS-readable tables (no session needed).
- `useResolvedPageImages` is not rewritten. Its three-tier logic (chosen → developer default → automatic project photo) is untouched; only the timing of the data it reads changes.
- Admin pages and anything auth-dependent are not touched in this step.

## Verification before I hand it back

- View source of `/` from a cold request and confirm the hero `<img src=...>` with the real storage URL is present in the raw HTML (not after JS).
- Load `/` in a real browser with an empty cache and confirm no grey placeholder frame appears, and that each photo slot resolves to the same photograph as today (chosen / default / automatic all matching the current live page).
- Confirm no hydration warnings in the console and no duplicate network request for page content or projects.
- Report measured hero paint time before/after.

Only the homepage this round. Projects, About, Services, Contact and Blog follow one at a time once you approve the result.
