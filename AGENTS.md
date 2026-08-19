# AGENTS.md - Halliday Architects

Rules for any AI agent working in this repository. Read this before making changes.

---

## Project identity

The website for **Halliday Architects**, a residential architecture practice in Ocean City, New Jersey, led by Christopher and Shannon Halliday, both RA and LEED AP.

The repository was originally remixed from a different client's project. Any reference to "Halliday Leonard" or a general contractor is leftover and wrong - this practice designs buildings, it does not build them.

---

## Hard rules

### 1. English only

There is no i18n layer and none should be added. No locale files, no `useTranslation`, no locale routing. Copy lives in components, in `src/content/firm.ts`, or in the database.

When borrowing a pattern from a project that has translations, strip the translation layer first.

### 2. No client data in migrations

Migrations define structure only. Projects, images, team members, posts and settings are entered through the admin panel or seeded separately.

### 3. Do not build features the client excluded

Out of scope and deliberately so:

- Lead capture beyond a plain contact form
- Newsletter, email campaigns, unsubscribe flows
- Popups, exit intent, chat widgets

The practice is referral-based and said plainly that it does not want the site chasing inquiries.

### 4. Image uploads always go through the pipeline

Every upload runs through `optimizeImage` with the appropriate preset. No exceptions, no direct-to-storage paths. Presets exist for headshots, project photography, blog bodies, covers, logos and favicons.

### 5. Storage cleanup is mandatory

Deleting a project, team member or post must delete its images from storage. Replacing an image must delete the one it replaced. Editing a post must delete body images no longer referenced. Orphaned files have been a recurring problem - do not add to them.

### 6. Roles and auth

Auth is inherited and working. Currently only the `admin` role exists. When the fuller role system is added, verify every RLS policy individually rather than assuming `is_admin()` covers the new cases.

---

## Architecture

React + TypeScript, Vite, TailwindCSS, shadcn/ui, Supabase (auth, database, storage), TipTap for rich text, MapLibre for maps, dnd-kit for reordering.

### Content model

| Table | Purpose |
|---|---|
| `projects` | Portfolio entries - title, slug, location, year, type, story, client brief, specs, features |
| `project_images` | Images with hero/card/gallery category, `is_cover` flag, sort order, alt text |
| `tags` + `project_tags` + `image_tags` | Design element vocabulary for filtering |
| `team_members` | Staff profiles |
| `blog_posts` + `blog_categories` | Journal |
| `site_settings` | Single row holding branding |
| `leads` | Contact form submissions |
| `user_roles` | Access control |

### Content vs data

`src/content/firm.ts` holds static firm facts - name, phone, address. Everything the client edits lives in the database and is managed through the admin panel.

### The tagging feature

Chris uses the site during client consultations to show solutions to specific design problems. Tags let him pull up "stairs" or "decks" in seconds. Filtering must stay fast and obvious, and must work on a phone.

---

## Design direction

The site follows the visual language of **stagehomy.com**. Reference that project with `@stagehomy` when working on anything visual.

- **Urbanist** throughout, extrabold and tight for headings
- White and grey tokens, generous whitespace
- Rounded button variants with arrow affordances
- Project cards at 4:5 with hover zoom and title reveal
- Project heroes fade into a white gradient
- Photography leads; interface recedes

An earlier direction used Newsreader serif with a paper/ink palette. That has been replaced. Do not reintroduce it.

For admin interaction patterns - dropzones, progress, multi-select, filtering, view toggles - reference `@demo-hotel-engine` and `@OCDG_V2_LIVE`. Take the behaviour, not their visual styling.

---

## Working method

### Before each change

Clone the repository fresh. Lovable commits directly, so an earlier local copy is likely stale.

### Prompt discipline

One task per prompt. State what to verify and on which rendered page. Plan mode for anything structural.

### Definition of done

A feature is finished when the client could use it without being taught. If adding a project needs explaining, the admin panel is not done.

---

## Deployment

Development happens on ha.stagehomy.com with `noindex` in place and `robots.txt` blocking crawlers. The site moves to hallidayarchitects.com only when finished and approved. Both protections must be lifted at launch, and the temporary subdomain and its DNS records removed.
