# Move Halliday Architects onto the SSR (TanStack Start) foundation

Your read of the situation is right, and one part is better than you think: this does not need a remix, a second project, or any data migration. Lovable has a supported in-place upgrade path from a Classic Vite SPA to TanStack Start, and this project qualifies.

## Answering your three questions directly

**Data stays put — yes, you are not oversimplifying.** The backend, tables, storage buckets, users, roles and edge functions are untouched. Only the rendering layer changes. Chris and Shannon keep their accounts; nothing is re-invited.

**Do it in this project, not a remix.** A remix would fork the codebase and you would then be maintaining two copies while the client reviews one of them. The in-place upgrade runs inside a single chat turn, and the whole turn is revertible from chat history if anything goes wrong. The live published site keeps serving the current build until the upgrade finishes and you publish. That is safer than a parallel project, not riskier.

**Auth and the data layer are the known-cost parts, and they are smaller than you fear.** The upgrade keeps React Query and the existing `useQuery` hooks working exactly as they do now — TanStack Start renders them on the server too. You do *not* have to rewrite 31 hooks into loaders to get the upgrade done. Server-side loaders are an optional second pass, applied per page, where they actually buy something.

## What this buys you

- Real HTML on first response instead of an empty shell, so no grey placeholder window on refresh.
- Search engines see rendered content, not a JS bootstrap.
- The preconnect / boot-prefetch / skeleton workarounds stop being load-bearing (they stay in place, they just stop mattering).
- Same foundation as Dorothe and Lumidenta.

## Plan — two phases, each verifiable on its own

### Phase 1 — the framework swap (one turn)

Run the supported Classic → TanStack Start migration on this project. It is largely deterministic:

1. Preflight: confirm the stack is eligible and the project builds clean today.
2. Scan and report what will need hand-translation before touching anything — routes, providers, `index.html` head tags, `main.tsx` boot code (your `prefetchBootData` and `HelmetProvider`), Tailwind tokens.
3. Swap framework scaffolding, merge `package.json`, delete the SPA entry points.
4. Generate the file-based route tree from the 40-odd routes in `src/App.tsx`, preserving every redirect and the admin guard on every admin route.
5. Build, typecheck, and serve-check each route.

**How you verify Phase 1:** the site looks and behaves pixel-identically — same design, same admin panel, same flows — but view-source now shows real markup. Nothing about the design system, components, or admin logic is rewritten in this phase.

Known items specific to this project that get handled during the swap:
- `react-helmet-async` gives way to TanStack's route-level `head()`; SEO output stays equivalent.
- MapLibre and the TipTap editor are browser-only and get loaded at point of use so they never evaluate on the server. Your existing lazy MapLibre work already points the right direction.
- `useSearchParams` in `AdminProjects` and `AdminAbout` keeps working through a compatibility shim.
- Tailwind moves v3 → v4; custom tokens are carried across and the class-name breaking changes are swept.
- Admin auth guard stays client-side, exactly as it is today. Admin is behind a login and does not need SSR.

### Phase 2 — server-side data, page by page (separate turns, only where it pays)

Once the framework is under you, convert fetching to server loaders one public page at a time, checking each before the next:

1. `/` (homepage) — the highest-value one, and the one your grey-card complaint is about.
2. `/projects` and `/projects/:slug`.
3. `/about`, `/services`, `/contact`.
4. `/blog` and `/blog/:slug`.

Admin pages stay on `useQuery`. There is no SEO or first-paint argument for server-rendering a screen behind a login, and leaving them alone removes most of the risk surface.

**On `useResolvedPageImages` — your instinct is correct, and here is how we de-risk it.** That hook composes three sources (chosen photo → developer default → automatic project fallback) and feeds the homepage wall, the About strip, the Services bands and the Contact hero. The rule for Phase 2: the resolver logic itself is not rewritten. Only *where its two input queries are fetched* changes — they move from client mount to a server loader, and the hook reads the already-populated cache. Same code, same fallbacks, earlier data. And each page that consumes it is converted and checked separately, so if the About strip changes, we know exactly which step caused it.

## Size of the job

Phase 1 is one working session and is mostly mechanical. Phase 2 is roughly one short session per page group, spread over as many turns as you like — the site is fully working and publishable between every one of them.

## Recommended sequencing around the client

Chris and Shannon are reviewing right now. Phase 1 does not touch the published site until you publish, so the review can continue uninterrupted. Do Phase 1, satisfy yourself on the preview, then publish once — the visible difference to them will be that the site loads instantly instead of flashing grey.

## Technical notes

- Migration path: the `migrate-to-tanstack` skill, run in place on this project.
- Backend: unchanged. No migrations, no bucket changes, no role changes, no edge function changes. `supabase/functions/sitemap` and `track-view` keep working as-is.
- Router: React Router v6 flat routes → TanStack file-based routes, including the `Navigate` redirects for `/developments`, `/gallery`, `/testimonials`, `/admin/*` and the legacy admin paths.
- `src/lib/queryClient.ts` and `prefetchBootData` survive Phase 1 and get retired page-by-page during Phase 2 as loaders take over.
- Revert path: the whole Phase 1 turn is one revert from chat history.
