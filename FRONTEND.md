# FRONTEND.md — Halliday Architects

Frontend conventions for this platform. Read alongside `AGENTS.md` (rules) and `PLAN.md` (roadmap).

## Stack

TanStack Start v1 (SSR) · React 19 · Vite · Tailwind v4 (CSS-first, no `tailwind.config.js`) · shadcn/ui · Lovable Cloud.

Every public route is server-rendered through a route loader that primes the TanStack Query cache, and every route declares its own `head()` (title, description, canonical, OG, Twitter). Metadata helpers live in `src/lib/seo.ts`.

## Typography and colour

- **Urbanist** everywhere, loaded with a `<link>` in `src/routes/__root.tsx`. Never `@import` a remote font in `src/styles.css`.
- Headings extrabold (800), tight tracking. Body 400.
- All colour lives in `src/styles.css` as tokens: `paper`, `sand`, `ink`, `stone`, `line`, plus the semantic shadcn set. Components never hardcode `text-white`, `bg-black`, or hex values.

## Layout rhythm

- Section padding, container widths and gaps come from `src/lib/rhythm.ts`. Nothing improvises spacing.
- Project photography uses the 1–2–3–2 row rhythm from `src/lib/projectRows.ts`, shared by the Projects archive and every project gallery: 4:3 frames, `gap-[2px]` in both directions, no empty cells, no orphan single row.
- Full-bleed photo bands run edge to edge; the site never leaves white gutters beside a photograph.

## Motion

Opacity fades with small translations, 400–600 ms ease-out, staggered 150 ms via `src/components/Reveal.tsx`. No bounce, no scale, no parallax.

## Images

One rule: **sharpness first**. See the image pipeline document for the full contract.

- Uploads go through `optimizeImage(file, preset)` — no direct-to-storage paths.
- Delivery goes through `ResponsiveImage` — no raw `<img>` with a storage URL.
- Every slot declares `sizes`, `maxWidth` (rendered width × 2 for retina) and `width`/`height` matching its aspect ratio.
- One `priority` image per page, above the fold.
- Replacing or deleting an image deletes the old object from storage.

## Content

Editable content lives in the database (`page_text`, `page_media`, `page_media_defaults`, `projects`, `services`, `team_members`, `blog_posts`, `site_settings`) and is resolved through the three-tier resolver: client choice → developer default → automatic project photography. Only immutable firm facts stay in `src/content/firm.ts`.

English only. There is no i18n layer and none should be added.

## Admin

Sidebar groups: WORKSPACE · MANAGE · SETTINGS. Admin pages mirror the public site so the client edits what they see. Mobile must be fully usable — tables collapse to cards, dialogs fill the viewport.
