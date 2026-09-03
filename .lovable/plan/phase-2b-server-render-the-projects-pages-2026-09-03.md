# Phase 2b — Server-render the Projects pages

Move `/projects` and `/projects/$slug` onto route loaders so their content ships inside the server HTML, exactly as the homepage now does.

## What changes

### 1. `/projects` (list)
Add a loader that primes, in parallel:
- page content (same key/fetcher the homepage loader uses)
- the shared projects catalogue under `["public-projects"]`

Nothing in the page component changes. The `1-2-3-2` row rhythm stays untouched — it is a pure function over the array it receives and does not care where the array came from.

### 2. `/projects/$slug` (detail)
- Extract the existing query function out of `usePublicProject(slug)` into an exported `fetchPublicProject(slug)` and have the hook call it — so the loader and the hook run byte-identical code.
- Export a shared key helper `publicProjectKey(slug)` returning `["public-project", slug]`, used by both the hook and the loader. No new or simplified key.
- Loader primes that key plus `["public-project-order"]` (the "next project" navigation) and page content, in parallel.
- If the project is missing, throw `notFound()`; add `notFoundComponent` and `errorComponent` to the route.

### 3. Boot prefetch
`prefetchBootData()` already skips entries the server hydrated, so no duplicate client requests. No change expected; verified during testing.

## What is NOT touched
`useResolvedPageImages`, image resolution tiers, the row-rhythm helper, admin code, styling, and every component's markup.

## Verification (same bar as the homepage)
1. `curl` the raw HTML of `/projects` and one `/projects/<slug>` — project titles and real image URLs must be present in the source, not injected after JS.
2. Playwright: count client-side Supabase requests for page content / projects on first load — must be zero.
3. Console: zero hydration warnings or errors.
4. Measure time-to-visible-content before/after and report both.
5. TypeScript + production build clean.

Result reported before moving on to About / Services / Contact.
