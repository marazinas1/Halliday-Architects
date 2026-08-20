# Admin landing screen at /admin

A quiet dashboard that answers "is anything waiting for me?" and "where do I go?" — no charts, no coloured metric tiles.

## Routing change

`/admin` currently renders the Projects list. It becomes the dashboard; the projects list moves to `/admin/projects`, and the sidebar gains a "Dashboard" item above "Projects" (Projects then matches `/admin/projects*` only). All existing links to project edit screens are unaffected.

## Sections

**1. Needs attention** (only when something is waiting)
- Unread inquiries, with a link to `/admin/inquiries` — owners and developer only
- Unpublished project drafts, linking to the projects list filtered to drafts
- Unpublished blog drafts, linking to `/admin/blog`
If nothing is waiting, a single plain line: "Nothing waiting. Everything is published and read." — not an empty card grid.

**2. Content overview**
Large, quiet numbers with small labels:
- Published projects
- Featured on homepage (with a gentle note when the count is not the four the homepage grid shows — currently 0 projects are flagged featured, so the homepage falls back to ordering)
- Published posts
- Team members (owners and developer only)

**3. Recent activity**
The last 6 items created or edited across projects, blog posts and team, newest first, each row showing type, title, what changed (created / edited), relative time, and linking to its edit screen. Team rows appear for owners and developer only.

**4. Quick actions**
Add a project, write a post, view the live site (new tab). Team-related actions are not shown to editors.

## Role awareness

Editors see: project and blog items in "Needs attention", published-project / featured / published-post counts, project and blog rows in recent activity, and the project/post/live-site actions. Nothing about inquiries or team is rendered — and no query for that data is issued at all, so no inquiry or team data appears in the editor's network responses. Owners and the developer account see everything.

## Design

Follows the existing admin language: Urbanist, `text-ink` / `text-stone`, `border-line` hairlines, `bg-card` panels, generous whitespace. Numbers set large and light-weight, labels small and uppercase-tracked. No icons-in-coloured-circles, no progress bars, no charts.

## Test content cleanup

The database has already been checked: `blog_posts` and `blog_categories` are both empty, so the test post and test category are gone. No deletion is needed and none will be performed.

## Technical notes

- New `src/pages/admin/AdminDashboard.tsx` plus a `src/hooks/admin/useDashboard.ts` holding role-gated React Query hooks: counts via `head: true` count queries, drafts via existing patterns, recent activity via three small `order(updated_at desc).limit(6)` selects merged client-side. Owner-only queries take an `enabled` flag driven by `isOwnerRole`, mirroring how `useUnreadInquiryCount` is already gated in the sidebar.
- Reuse `useUnreadInquiryCount` rather than duplicating it.
- Route registration in `src/App.tsx`; `AdminProtected` with default `staff` access.
- No schema changes, no RLS changes. Existing policies already block editors from `leads` and `team_members` server-side, so the client gating is presentation on top of enforced rules.

## Verification

Sign in as a temporary owner account and confirm all sections render with counts matching direct database queries; sign in as a temporary editor account and confirm the dashboard renders without inquiry or team sections and that no inquiry/team request appears in the network log. Click through every link to confirm the destination screen. Delete both test accounts afterwards.
