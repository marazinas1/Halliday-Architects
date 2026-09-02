# Fix the grey placeholder flash on the homepage

## What is happening

The homepage does not know which photographs to show until the browser has finished two backend requests: the editable page content (`page_media` + `page_media_defaults` + `page_text`) and the published projects list. Only after both resolve does `<img>` appear in the page — so the browser cannot even *start* downloading the hero until then. Until that moment every frame shows the grey `bg-sand` frame, exactly as in the recording.

Two delays stack up:

1. Round trip to the database to learn the photo URL (nothing is cached between refreshes).
2. Only then the hero download starts — and the hero is intentionally a large, high-quality file.

## The fix

1. **Remember the resolved photo URLs between visits.** Cache the page-content query result in `localStorage` and hydrate React Query from it on boot. On a refresh the hero URL is known in the first frame, so the image request starts immediately and usually comes straight out of the browser cache.

2. **Preload the hero.** Once the hero URL is known, inject a `<link rel="preload" as="image" imagesrcset ... fetchpriority="high">` so the download is queued at the highest priority instead of after React renders.

3. **Blur-up instead of flat grey.** Each photo frame gets a tiny (~32px) transformed variant of the same image as a blurred CSS background, revealed instantly, with the full image fading over it once decoded. No more grey rectangles, even on a cold cache.

4. **Don't animate photographs that are on screen at load.** The two gallery rows use `Reveal`, which starts at `opacity-0`; on a refresh mid-page that adds to the perceived emptiness. Above-the-fold wall images render visible immediately; reveal stays for content further down.

5. **Keep the quality balance.** No change to hero resolution or quality — the perceived slowness is the round trip and the missing preload, not the bytes. Grid images stay lazy and q80.

## Technical notes

- `src/hooks/usePageContent.ts` — persist/restore the query payload (versioned key, ~24h TTL); serve it as `initialData` so the first render has URLs.
- `src/hooks/useResolvedPageImages.ts` — unchanged three-tier logic (chosen → developer default → automatic), it just resolves sooner.
- `src/components/ResponsiveImage.tsx` — optional `placeholderUrl` (32px q30 variant) rendered as a blurred backdrop, plus a fade on `load`; export a helper to build the preload link.
- `src/pages/Index.tsx` — preload link for `wall_1`, blur-up on all six frames, first-screen frames rendered without the reveal offset.

## Verification

Reload the homepage in a headless browser with cache cleared and with a warm cache, capture frames at 200 ms intervals, and confirm the hero shows image content (blur or full) in the first painted frame and no grey card is visible after the content query returns.
