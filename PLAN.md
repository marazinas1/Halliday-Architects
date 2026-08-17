# Halliday Architects - Build Plan

**Client:** Christopher & Shannon Halliday, Halliday Architects, Ocean City NJ
**Repo:** `marazinas1/halliday-architects`
**Base:** remixed from `halliday-leonard-v2` (portfolio schema, no history)
**Language:** English only. No i18n layer. Do not introduce one.

---

## What the client asked for

From client emails, in his own words:

- A refresh of the overall design; the current site is a Squarespace template
- The site is a **digital portfolio** where potential clients review their work
- They **use the images to show clients potential solutions to design issues** during consultations
- They do **not** rely on the site for inquiries - the practice is referral-based
- New projects are added roughly **every 6 months**
- He wants **a blog that functions as their social media platform**, replacing Instagram/Facebook
- Domain on GoDaddy, site currently on Squarespace

### What this implies

The site is not a lead-generation funnel. Do not add aggressive CTAs, popups, lead magnets, or newsletter capture. It is a **credibility surface and a working tool**.

The "show clients solutions to design issues" line is the most important sentence in the brief. It means Chris opens the site **in front of a client** and needs to find relevant imagery fast. Filtering and browsing quality matter more than conversion optimisation.

---

## Scope - Phase 1 (paid, $6,000)

- Full visual redesign
- Projects portfolio with context (name, location, year, type, story)
- Image filtering so specific solutions can be found quickly
- Blog with admin
- Team page with real bios
- About / firm story
- Contact
- Admin panel: projects, images, team, blog
- Fully responsive, fast, SEO fundamentals

## Explicitly out of scope - Phase 2 (later, priced separately)

Do not build these now. They are the upsell path and were named in the proposal:

- Client inquiry tools / lead capture workflows
- Advanced search and saved filters
- Deeper SEO programme
- Client portal
- Newsletter / email campaigns

---

## Current state of the base

Inherited from `halliday-leonard-v2`:

| Area | State |
|---|---|
| Tables | `projects`, `project_images`, `leads`, `user_roles` |
| Auth + roles | Working, inherited from OCDG lineage |
| Public pages | Index, Projects, Project, Team, About, Services, Testimonials, Contact |
| Sections | Portfolio, Team, About, Services, Contact |
| Admin | AdminLogin, AdminProjects (125 lines), AdminProjectForm (577 lines) |
| i18n | **None** - good, keep it that way |
| Team data | **Hardcoded** in `src/content/hallidayLeonard.ts` |
| HL branding | Present in 18 files including `index.html` and `SEO.tsx` |

### Fields to remove from `projects`

These are Halliday-Leonard developer-pitch fields with no meaning for an architecture practice:

`vision_floors`, `vision_headline`, `vision_caption_eyebrow`, `vision_caption_title`,
`location_neighborhood`, `location_highlight`, `location_heading`, `location_features`,
`map_embed_query`

### Fields to add to `projects`

- `project_type` - new build / renovation / interior / addition
- `year_completed`
- `story` - long form narrative, the differentiator vs the current site
- `client_brief` - optional, the problem the project solved

---

## Phases

Each phase is a separate Lovable session. One task per prompt. Verify before moving on.

### Phase 0 - Cleanup (do first, nothing else works until this is clean)

Strip every trace of Halliday-Leonard so no client-facing string is wrong.

- Rename `src/content/hallidayLeonard.ts` to `src/content/firm.ts`
- Replace `FIRM` constant with Halliday Architects details:
  - Name: Halliday Architects
  - Phone: 609.957.6789
  - Fax: 609.337.1758
  - Address: 728 West Avenue, Suite A, Ocean City, NJ 08226
  - Emails: chris@hallidayarchitects.com, shannon@hallidayarchitects.com
- Update `index.html` title, meta description, favicon
- Update `SEO.tsx` defaults
- Update `GlobalNav`, `GlobalFooter`, `AdminShell`
- Delete `TestimonialsPage`, `TestimonialsCarousel`, `TESTIMONIALS` - client did not ask for testimonials and has none supplied
- Delete `ServicesPage` and `SERVICES` **or** repurpose - decide with Marius. An architecture practice may want a services page, but it was not in the brief.

**Verify:** grep for `halliday-leonard`, `hallidayLeonard`, `Halliday Leonard`, `HallidayLeonardInc` returns nothing.

### Phase 1 - Data model

Migrations only. No client data in migrations - seed separately.

1. Alter `projects`: drop the vision/location fields listed above, add `project_type`, `year_completed`, `story`, `client_brief`
2. Create `project_tags` and `image_tags` (or a shared `tags` table with join tables) for the filtering feature
3. Create `team_members`: name, role, bio, credentials, headshot path, sort order, published
4. Create `blog_posts`: title, slug, excerpt, body, cover image, category, published, published_at
5. Storage buckets for project images, headshots, blog covers

**Verify:** types regenerate cleanly, RLS policies mirror the existing `projects` pattern.

### Phase 2 - Design system

Establish the visual language before building pages, so nothing needs redoing.

- Palette: neutral base (white, warm off-white, deep near-black text). The Halliday logo is red on black - red stays the single accent, used sparingly.
- Typography: one restrained serif or high-quality grotesque for headings, clean sans for body. Architecture portfolios live and die on typography.
- Spacing: central rhythm tokens file (`src/lib/rhythm.ts` pattern, as used on the Dorothe build) so vertical spacing propagates from one place.
- Motion: slow, minimal, opacity and slight translate only. No bounce, no parallax gimmicks.

**Reference standard:** the site should sit comfortably next to the portfolios of well-regarded architecture practices. Large imagery, generous whitespace, quiet typography, image-first.

### Phase 3 - Public pages

1. **Home** - must communicate who they are within 3 seconds. Hero image, one clear line about the practice, selected work, short firm intro, path into projects. The current site fails precisely here: it is a single photo and nothing else.
2. **Projects index** - grid with filtering by type and tag
3. **Project detail** - hero, story, gallery, specs, next project
4. **Team** - real bios, headshots, credentials (LEED AP, RA)
5. **About** - firm story, approach, what clients can expect
6. **Contact** - simple, honest, no hard sell

### Phase 4 - Blog

This is the module the client is most personally invested in - it replaces their social media.

- Index with categories
- Post detail, designed for image-heavy posts
- Related posts
- OG tags so shared links look right

### Phase 5 - Admin

Borrow patterns from the Dorothe build (list + form structure, image upload flow, media handling). Take the UI patterns only - **do not carry over the German/English translation system**.

- Projects list + form (already exists, adapt to new fields)
- Image management with tagging
- Team CRUD
- Blog CRUD with a usable editor

Chris and Shannon must be able to add a project or write a post without help. If it needs explaining, it is not done.

### Phase 6 - Polish

- SEO meta per page, structured data for the practice
- OG images
- Responsive audit at real breakpoints
- Lighthouse pass
- Accessibility: alt text, focus states, contrast
- 404, loading and empty states

---

## Assets needed from client

Requested by email 2026-08-17:

- [ ] Original high-resolution project photos, grouped per project
- [ ] Project details: name, location, year, type
- [ ] Optional narrative per project
- [ ] Team bios and headshots
- [ ] Firm description
- [ ] Vector logo

Nothing in Phase 3 onward can be finished without the photos.

---

## Working method

- Clone the repo fresh before writing each Lovable prompt - Lovable commits directly and local copies go stale
- One task per prompt, with explicit verification steps referencing rendered pages
- Plan mode for structural changes
- Build on the temporary Lovable domain; migrate to the client domain only at launch
- Send preview links at natural milestones, as promised in the proposal

## After launch

Monthly maintenance is introduced **after** the site is live and the value is visible, not before. It was deliberately left out of the proposal.
