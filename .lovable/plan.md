# Admin panel: mirror the public site

Today the sidebar is a flat list of eleven items in no particular order (Dashboard, Projects, Tags, Team, Testimonials, Blog, Inquiries, Homepage, Analytics, Users, Settings). Chris and Shannon have to know which technical thing lives where. The fix is to organise the panel the same way the website reads, so "change the About page" means "open About".

## Proposed sidebar

```text
WORKSPACE
  Dashboard        quick actions, what needs attention, recent edits
  Inquiries        (owner)
  Analytics        (owner)
  Users            (owner)

THE WEBSITE
  Home             photo wall, three tiles, practice statement
  Projects         list + New project | tab: Tags
  About            page text + photos | tabs: Team, Testimonials
  Services         service bands: text, order, photos, add/remove
  Blog             posts | tab: Categories
  Contact          intro text + hero photograph

SETTINGS
  Settings         logo, dark logo, favicon, site name, inquiry notification emails
```

Reasoning behind the two judgement calls you raised:

- **Tags belong inside Projects.** They only ever describe projects. As a tab on the projects screen the whole flow is one place: add a tag, create the project, pick the tags, upload photos, publish.
- **Settings stays separate, not merged into Home.** Logo, favicon and notification addresses are set once and apply to the entire site, not to the homepage. Page content is edited often; brand setup almost never. Keeping them apart stops the everyday screens from filling up with things nobody should touch again.
- **Team and Testimonials move under About**, because that is the only page where they appear. Nothing is removed, just relocated as tabs.

## Home screen (the biggest change)

The current Homepage screen still edits the old V1 hero (one image plus headline and subline). The live homepage is V2: a four-photograph wall, a centered practice statement, then three tiles (Projects, About, Contact). The admin screen is rebuilt to show exactly that, in miniature:

- **Photo wall** — four slots laid out in the same shape as the live page (one wide, two side by side, one wide). Each slot has its own "Change photo" control and shows what is currently used. Unfilled slots fall back to project photography as they do now.
- **Practice statement** — the centered text, with the current wording as placeholder.
- **Three tiles** — Projects, About, Contact, each with its own photograph, changed the same way.
- **Preview** button opens the homepage with unsaved changes applied, as it already does.

### The photo picker, reworked

Used everywhere a photograph is chosen (home, tiles, services, about, contact):

- Opens on **From projects** by default.
- Projects become **horizontal tabs across the top** — "111 Anchor Rd", "11605 Paradise Drive", "19 Flamingo Road", … in the same order as the projects list — so only one project's photographs are visible at a time instead of an endless scroll. Tabs scroll sideways when there are many.
- Search still filters across all projects.
- **Upload** remains as a second tab for photographs that belong to no project.
- Clearing a project photograph never deletes the project's copy (unchanged behaviour); clearing an uploaded one removes it from storage.

## Services screen

Services are currently hard-coded in the code and their photographs are just "project number N". They become editable:

- A list of service bands in display order, drag to reorder.
- Each has: title, body text, the list of items it includes, an icon, and a photograph chosen with the same picker.
- Add a new service, edit, delete, and show/hide without deleting.
- The public Services page renders from this list, falling back to the current six if none exist.

## About screen

- The page's own text blocks (opening statement, "how we work" paragraphs) and the photostrip photographs.
- **Team** tab: existing team management, unchanged.
- **Testimonials** tab: existing testimonials management, unchanged.

## Contact screen

Intro text and the hero photograph. The map, address and phone stay as firm constants — those change once a decade and belong with the developer.

## Dashboard

Kept as it is, with three adjustments: the quick actions gain "Edit the homepage", the "needs attention" block keeps unread inquiries and drafts, and every card links into the new locations.

## Role behaviour

Editors keep access to Projects, Blog and the page-content screens. Inquiries, Analytics, Users, Team, Testimonials and Settings stay owner-only, exactly as now. Nothing an editor cannot use is queried for them.

## Technical notes

- Sidebar becomes three `SidebarGroup` blocks with labels; items gain a `group` field. Route matching updates for the nested tabs.
- New routes: `/admin/home`, `/admin/about`, `/admin/services`, `/admin/contact`. `/admin/homepage` redirects to `/admin/home`; `/admin/tags`, `/admin/team`, `/admin/testimonials`, `/admin/blog/categories` keep working and open as the tab of their parent screen.
- New table `page_media` (`page`, `slot`, `bucket`, `path`, `alt`, unique on page+slot) for every editable image slot outside projects — replaces the single `hero_image_*` pair on `site_settings`, which is migrated into it. Grants: `select` to `anon`/`authenticated`, write to staff via RLS.
- New table `page_text` (`page`, `slot`, `value`) for editable copy, same policy shape; existing `intro_heading` migrates in.
- New table `services` (`title`, `body`, `includes jsonb`, `icon`, `sort_order`, `published`, image via `page_media` slot `service:<id>`), staff-write / public-read.
- `HeroImagePicker` is generalised into a reusable `ImagePicker` with the project-tab layout, and used by all page screens.
- Storage cleanup rules stay as in AGENTS.md: replacing or clearing an uploaded image deletes the old file; project references are never deleted.
- No changes to projects, blog, team, testimonials, leads or roles schemas.

## Order of work

1. Sidebar regrouping and routes (visible immediately, no schema change).
2. `page_media` / `page_text` migration plus the reworked picker, then the Home screen.
3. Services table and screen.
4. About and Contact screens, Team/Testimonials as tabs.
5. Dashboard link and quick-action updates.
