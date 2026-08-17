# AGENTS.md - Halliday Architects

Rules for any AI agent working in this repository. Read this before making changes.

---

## Project identity

This is the website for **Halliday Architects**, an architecture practice in Ocean City, New Jersey, run by Christopher Halliday (RA, LEED AP) and Shannon Halliday.

This repository was remixed from a different client's project (`halliday-leonard-v2`, a general contractor). **Any string referencing "Halliday Leonard", "Halliday-Leonard General Contractors", or `hallidayLeonardInc` is leftover and wrong.** Remove it, never propagate it.

---

## Hard rules

### 1. English only

There is no i18n layer and none should be added. No `de.json`, no `useTranslation`, no locale routing. All copy is written directly in components or in `src/content/firm.ts`.

If a pattern is borrowed from another project that has translations, strip the translation layer before applying it here.

### 2. No client data in migrations

Migrations define **structure only**. Projects, images, team members, blog posts, settings - all of it goes into seed files or is entered through the admin panel. This keeps the codebase reusable and the database honest.

### 3. Do not build Phase 2 features

The following were explicitly excluded from the paid scope and must not be added, even if they seem like obvious improvements:

- Lead capture forms beyond a plain contact form
- Newsletter signup, email campaigns, unsubscribe flows
- Client portals or logins for anyone other than the site owners
- Popups, exit intent, chat widgets

The practice is referral-based. The client said plainly they do not want the site to chase inquiries.

### 4. Roles and auth

The auth and role system is inherited and working. The `enforce_role_integrity` trigger runs BEFORE INSERT.

**A `user_invitations` row must exist before the user is created**, or the role silently defaults to viewer and needs a manual UPDATE afterwards. Follow that order.

### 5. Storage cleanup

When a project, team member, or blog post is deleted, its images must be deleted from storage too. A known gap on an earlier build left orphaned files behind. Do not repeat it.

---

## Architecture

### Stack

React + TypeScript, Vite, TailwindCSS, shadcn/ui, Supabase (auth, database, storage).

### Content model

| Table | Purpose |
|---|---|
| `projects` | Portfolio entries - name, location, year, type, story, specs |
| `project_images` | Images, categorised hero / card / gallery, with sort order |
| `team_members` | Staff profiles - name, role, credentials, bio, headshot |
| `blog_posts` | Posts - title, slug, excerpt, body, cover, category, published |
| `tags` + joins | Filtering by design element (kitchens, stairs, decks, facades) |
| `user_roles` | Access control |
| `leads` | Plain contact form submissions only |

### Content vs data

- `src/content/firm.ts` holds **static firm facts**: name, phone, address, email. These change almost never and do not belong in the database.
- Everything the client edits - projects, team, posts - lives in Supabase and is managed through the admin panel.

### The tagging feature

Chris uses the site during client consultations to show solutions to specific design problems. Tags exist so he can pull up "stairs" or "decks" or "kitchens" in seconds while sitting with a client.

This is a working tool, not decoration. Filtering must be fast, obvious, and survive on mobile.

---

## Design principles

The current Squarespace site fails in three specific ways. Do not reproduce them.

1. **The homepage says nothing.** One photo, no words. The new homepage must communicate who the practice is and the level it works at, immediately.
2. **Projects have no context.** A wall of images with no names, locations, or stories. Every project gets a title, a place, a year, and ideally a narrative.
3. **The team is a list of labels.** Names and job titles only. Real bios build trust and referrals.

### Visual direction

- Image-first. Photography is the product; the interface stays out of its way.
- Neutral palette. The red from the logo is the only accent, used sparingly.
- Generous whitespace. Crowding reads as cheap.
- Restrained typography, strong hierarchy.
- Motion is slow and minimal - opacity and small translations only.

Benchmark: the site should hold its own beside the portfolios of respected architecture practices. The client's work is high quality; the site has to signal that within seconds, because referrals often arrive as "look at their website".

---

## Working method

### Before each change

Clone the repository fresh. Lovable commits directly, so a local copy from an earlier session is likely stale.

### Prompt discipline

- One task per prompt
- State explicitly what to verify and on which rendered page
- Use Plan mode for anything structural
- Never remix after making changes - remix first, then work

### Definition of done

A feature is finished when the client could use it without being taught. If adding a project requires an explanation, the admin panel is not done.

---

## Deployment

Development happens on the temporary Lovable domain. The site moves to `hallidayarchitects.com` only when everything is finished and approved. The domain is registered with GoDaddy; the current site is on Squarespace and stays live until cutover.
