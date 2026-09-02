# Pre-handover polish: speed, sharpness, consistency

A full read of the public site plus a live load measurement. Findings first, then the work.

## What the recording actually shows

The grey cards are not slow images — they are a slow *chain*. Measured on the running site:

```text
0ms      HTML arrives
585ms    JavaScript parsed, React starts
690ms    first database call leaves the browser (settings)
1115ms   page photographs + projects requested
1250ms   project images requested (second round trip)
~1300ms  the browser finally learns the hero photo's URL
2550ms   hero photograph painted
```

Nothing is wrong with the photographs. The browser simply does not know which
photograph to fetch until three round trips have finished, so it paints grey
boxes in the meantime. Everything below attacks that chain.

## 1. Make photographs start downloading ~1 second earlier

- Add `preconnect` for the backend/storage origin in `index.html`, so the
  connection is already open when the first query fires.
- Start the page-content and projects queries at app boot, in parallel, instead
  of waiting for the page's lazy-loaded chunk to arrive. The homepage hero URL
  becomes known at roughly 700ms instead of ~1300ms.
- Home hero no longer waits on the projects query: when a chosen or default
  photograph exists (it does), it renders from page content alone.

No localStorage caching and no blur placeholders — those were tried before and
caused the flicker we removed.

## 2. Skeletons that do not jump

Grey blocks stay (they are honest), but they must occupy exactly the final
shape so nothing shifts when the photograph lands:

- Project detail page: currently just the word "Loading" then a jump to a
  full-height hero. Give it a hero-shaped skeleton.
- Services bands: currently reserve image space for bands that turn out to have
  no image, then collapse from two columns to one. Reserve only when an image
  is actually coming.
- Contact photo band: currently can vanish entirely after load if no photograph
  resolves. Decide before painting.
- Contact map: MapLibre makes this page ~980KB (259KB gzip), more than every
  other page combined. Load the map only when the user scrolls to it (lazy
  import behind an IntersectionObserver), showing a static placeholder of
  identical height until then so nothing jumps.
- `PhotoFrame` in `Index.tsx` declares `width={2000} height={1400}` for every
  slot, including the lower `aspect-[3/4]` upright cards. Declared dimensions
  must match each slot's real ratio.


## 3. Consistency pass (the "tidy edges" question)

Confirmed: Contact's edges do **not** match the rest of the site.

- Contact's header uses `px-6` while its photo band below uses the standard
  container (`px-6 md:px-8`) — an 8px mismatch from tablet up. The same drift
  exists on Projects, Services, Blog, About and the homepage manifesto.
  Fix: every page header adopts the shared gutter.
- Contact's photograph is boxed to 1440px while Home and Projects run their
  photography full width. Fix: Contact's photo band goes full-bleed, matching
  the dominant standard.
- Page headers fade in on Contact, Projects and Blog but appear instantly on
  About and Services. Fix: same treatment everywhere.

## 4. Gaps worth closing before the client sees it

- **404 page** is unstyled and unbranded — no navigation, no footer, wrong
  colours, wrong fonts. Rebuild it in the site's language.
- **Project not found** state has no SEO tags, so it inherits the previous
  page's title.
- **Blog post cover** is the only page hero still using a plain image tag: no
  responsive sizes, full master downloaded, and empty alt text.
- **Team headshots and partner logos** also bypass the responsive pipeline.
- **Mobile menu**: hidden links stay reachable by keyboard when the menu is
  closed.
- **Dead code**: `PortfolioSection.tsx` and `PageHero.tsx` are imported by
  nothing. Remove them so the next developer is not misled.

## 5. Caching and payload

- `staleTime` is set on some queries and missing on others, so moving between
  pages refetches team members, blog posts and individual projects every time.
  Bring them in line with the rest.
- The project detail query selects every column, including admin-only fields.
  Narrow it to what the page renders — carefully: the `usePublicProjects` family
  also feeds the homepage wall, the About strip and the Services bands through
  `useResolvedPageImages`. Dropping a field used to compute `card_image_url`
  breaks the homepage, not Projects. Keep the detail-query narrowing separate
  from the shared list query and verify the homepage on its own afterwards.


## Sharpness: unchanged

No quality reductions anywhere. Masters stay at 3000px, every slot keeps its
2x-retina ceiling, hero stays q85. The speed work above removes waiting, not
pixels.

## Technical notes

- `index.html`: preconnect to the backend origin.
- `src/main.tsx` / `src/App.tsx`: prefetch `page-content` and `public-projects`
  into the query client at boot.
- `src/pages/Index.tsx`: hero renders on page-content alone; above-the-fold
  photographs keep `priority`.
- `src/lib/rhythm.ts`: add a shared `pageHeader` class so headers stop
  hand-rolling padding; apply it in Index, Projects, Services, Contact, Blog,
  About.
- `src/pages/ContactPage.tsx`: full-bleed photo band, stable band height,
  deferred MapLibre load.
- `src/components/ContactMap.tsx`: lazy chunk + observer + placeholder.
- `src/pages/Index.tsx`: per-slot `width`/`height` matching each aspect ratio.

- `src/pages/ProjectPage.tsx`, `ServicesPage.tsx`: shape-matched skeletons.
- `src/pages/NotFound.tsx`: rebuild with nav, footer, SEO, site tokens.
- `src/pages/BlogPostPage.tsx`, `sections/TeamSection.tsx`,
  `sections/PartnersSection.tsx`: move to `ResponsiveImage` with correct
  `sizes`/`maxWidth`, real alt text.
- `src/components/GlobalNav.tsx`: make the closed mobile menu untabbable.
- `src/hooks/usePublicProjects.ts`, `usePublicBlog.ts`, `useTeamMembers.ts`,
  `usePublicGallery.ts`: add `staleTime`; narrow the detail-project select.
- Delete `src/components/sections/PortfolioSection.tsx` and
  `src/components/PageHero.tsx`.

## Verification

Re-measure hero paint time on Home, Projects, About and Contact before/after,
check every page at 1440px and 390px for gutter alignment, confirm image widths
are unchanged at 1x and 2x, confirm the Contact bundle drops sharply and the map
still appears on scroll, and re-check the homepage separately after the query
narrowing.
