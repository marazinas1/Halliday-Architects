# Halliday Architects - Build Plan

**Client:** Christopher & Shannon Halliday, Halliday Architects, Ocean City NJ
**Repo:** `marazinas1/halliday-architects`
**Preview:** ha.stagehomy.com (noindex until launch)
**Target domain:** hallidayarchitects.com (GoDaddy, currently on Squarespace)
**Language:** English only. No i18n layer.

---

## The brief, in the client's words

- A refresh of the overall design; the current site is a Squarespace template
- The site is a **digital portfolio** where potential clients review their work
- They **use the images to show clients potential solutions to design issues** during consultations
- They do **not** rely on the site for inquiries - the practice is referral-based
- New projects are added roughly **every 6 months**
- He wants **a blog that functions as their social media platform**, replacing Instagram/Facebook

The consultation line is the most important one in the brief. Tag filtering exists so Chris can pull up "stairs" or "kitchens" in seconds while sitting with a client.

---

## Current state

### Built and working

| Area | State |
|---|---|
| Tables | `projects`, `project_images`, `tags`, `project_tags`, `image_tags`, `team_members`, `blog_posts`, `blog_categories`, `site_settings`, `leads`, `user_roles` |
| Public pages | Home, About, Team, Services, Projects index, Project detail, Blog index, Blog post, Contact |
| Projects | Full module - image manager with drag & drop, cover flag, categories, per-image tags, filtering by type and tag, lightbox, mixed-width gallery |
| Team | Database-driven, admin CRUD, photo upload, ordering |
| Blog | Posts, categories, TipTap editor, inline images, sanitized rendering, drafts |
| Branding | `site_settings` drives logo, dark logo, favicon and site name across public site and admin |
| Admin | Sidebar shell, search, filters, card/list toggle, preview buttons, tag management |
| Images | Shared optimisation pipeline (WebP, presets per use case, EXIF stripped, storage cleanup) |
| Map | MapLibre + CARTO on Contact, no Google, no API key |

### Content loaded

Four real projects: 111 Anchor Rd, 11605 Paradise Drive, 19 Flamingo Road, 10 Leyte Lane. Team seeded with five members and headshots taken from the previous site. One test blog post exists and must be removed before handover.

### Design direction

The site follows the visual language of stagehomy.com: **Urbanist** throughout, extrabold tight headings, white and grey tokens, rounded button variants, 4:5 project cards with a restrained hover zoom; project name and location always visible beneath the image, matching the projects index, project heroes fading into a white gradient.

This replaced an earlier Newsreader serif direction. The current direction is settled - do not reintroduce the serif unless the client asks.

---

## Remaining work

### 1. Dynamic homepage
Move the hero image, hero copy and intro paragraph into `site_settings` so the client can change them. Add an explicit `featured` flag on projects so the homepage selection is independent of projects page ordering.

Keep the editable surface small: five fields the client will actually use, not thirty they will ignore.

### 2. Role system
`app_role` currently has only `admin`, and every RLS policy uses `is_admin()`. Needs three roles:

- **Owner**: everything, including settings and user management
- **Admin**: content and team, not settings
- **Editor**: projects and blog only - cannot touch team or settings

This touches RLS on every table and is security-sensitive. Treat it as its own phase and verify each policy rather than assuming.

### 3. Inquiries - done, except email delivery
Built: `/admin/inquiries` inbox (search, unread/all/archived filters, detail panel with mailto, read/unread toggle, archive instead of delete, unread badge on the sidebar). `leads` gained `read_at`, `archived_at`, `project_type`, `timeline`, `notified_at`, `notify_error`. An `AFTER INSERT` trigger calls the `notify-inquiry` edge function, which emails the addresses set in Settings > Inquiry notifications.

**Outstanding, blocking launch:** the sending domain `notify.hallidayarchitects.com` is not verified, so notification emails currently fail with `no_matching_sender` and the failure is recorded on the enquiry (`notify_error`, shown in admin). Verify the domain before launch, then re-test by submitting the public contact form. Until then, inquiries must be checked in the admin panel.

### 4. Admin dashboard
A quiet landing screen: content counts, recent drafts, quick actions. Not a metrics dashboard - this site is edited a few times a year, not daily.

### 5. Polish and launch
SEO meta per page, social preview images (needs prerendering or build-time generation, since runtime OG tags do not work on a Vite SPA), 404 states, accessibility pass, Lighthouse.

---

## Launch checklist

- [ ] Remove test content (test blog post and category)
- [ ] Verify the email sending domain so inquiry notifications deliver, then submit a test enquiry and confirm the email arrives
- [ ] Set the inquiry notification recipients in Settings (both principals)
- [ ] Remove the `noindex` meta from `index.html`
- [ ] Open `public/robots.txt` (Allow: /, disallow /admin, sitemap pointing at hallidayarchitects.com)
- [ ] Point hallidayarchitects.com DNS at the deployment
- [ ] Disconnect ha.stagehomy.com in Lovable
- [ ] **Delete the `A ha` and `TXT _lovable.ha` records from stagehomy.com DNS in Hostinger** - leaving them live creates a duplicate of the client's site
- [ ] Promote the client to owner and verify their access
- [ ] Confirm Squarespace can be retired

---

## Assets still needed from the client

- [ ] Curated project selection (Chris is choosing)
- [ ] Project descriptions and team bios (in progress)
- [ ] A real headshot for Chris - the old site used a placeholder file
- [ ] Firm description in their own words

---

## Working method

- Clone the repo fresh before each Lovable prompt; Lovable commits directly and local copies go stale
- One task per prompt with explicit verification steps
- Plan mode for structural changes, Build mode for targeted fixes
- Reference other projects with `@` so Lovable reads their code directly: `@stagehomy` for visual language, `@demo-hotel-engine` for admin interaction patterns, `@OCDG_V2_LIVE` for admin features
- Never trust the completion summary; verify in the repo

## After launch

Monthly maintenance is introduced after the site is live and the value is visible. It was deliberately left out of the proposal.
