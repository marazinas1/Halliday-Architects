# Admin panel audit against the updated Deerva standards

The admin area already matches the standard on sidebar grouping (Workspace / Manage / Settings), full-width sections, one sign-in gate and role-based access. The remaining gaps are visual and naming ones, plus a few screen behaviours.

## What is wrong today

1. **Colours use project-specific names.** Every admin screen paints itself with `ink`, `stone`, `sand`, `paper`, `line`. The standard allows only the shared core roles, so the panel follows the theme automatically.
2. **Settings tab names carry technical suffixes.** They read "Home texts", "About texts", "Services texts", "Contact texts". They must read exactly like the public menu: Home, About, Services, Contact — and Contact must be last.
3. **Tab strip looks heavier than the standard.** Active tabs use a dark underline; the standard uses a quiet full-width line with a coloured underline on the active tab only.
4. **Page headings are inconsistent.** Different sizes per page, two pages use a light serif-style heading, several pages have no one-sentence explanation under the title.
5. **Badges are missing or inconsistent.** Lists do not consistently show published/hidden state, "You" on your own user row, or a read-only note when the role cannot edit.
6. **Testimonials is a plain table.** The standard makes it the reference expandable editor — collapsed rows with title, state and order, editing inline.
7. **Dashboard section order** is Needs attention → Content → Traffic → Recent activity → Quick actions; the standard is Needs attention → Numbers → Quick actions.

## What I will change

- Replace every project-specific colour name in the admin screens and admin components with the shared core roles. No visible colour change is intended — the palette stays exactly as it is now.
- Rename Settings tabs to Home, About, Services, Photographs, Contact, with Contact last, and keep Business & appearance first.
- Rework the shared tab strip to the standard look: one quiet line under the row, active tab marked with a coloured underline and stronger text, horizontally scrollable on phones.
- Give every admin page the same header: title on the left with one sentence under it, at most one main action on the right.
- Use badges consistently: role and "You" on users, Published / Hidden on projects, articles, services, testimonials and team, and a short read-only note where an editor cannot change something.
- Convert Testimonials to the expandable editor: collapsed row shows author, state and order; opening one edits it in place, with save confirmation and a delete confirmation that names the quote.
- Reorder the dashboard into Needs attention → Numbers → Quick actions, folding the current Content and Traffic figures into Numbers and keeping recent activity inside the attention block.

## Technical notes

- Token mapping: `text-ink`→`text-foreground`, `text-stone`→`text-muted-foreground`, `bg-sand`→`bg-muted`, `border-line`→`border-border`, `bg-paper`/`text-paper`→`bg-background`/`text-primary-foreground` depending on context. Public-site components keep their current classes; this change is scoped to `src/pages/admin/*` and `src/components/admin/*`.
- `src/components/ui/badge.tsx` gains `success`, `warning` and `info` variants driven by existing status tokens and switches to the theme radius instead of a pill.
- `SectionTabs.tsx` becomes the single admin tab strip used by Settings and the Projects/Blog sub-navigation.
- Testimonials rework reuses the existing `useAdminTestimonials` hooks; no schema or query changes.
- No database migration, no change to public pages, no change to permissions or RLS.

## Verification

Typecheck and build, then a signed-in pass over Dashboard, Projects, Articles, Testimonials, Users and every Settings tab at phone and desktop width, checking headers, tabs, badges and that nothing lost its colour.
