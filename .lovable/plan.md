# Role system: platform_owner / owner / editor

Three roles replace the single `admin`. Every table gets an explicit decision, enforced in the database first and mirrored in the interface second.

## Roles

- **platform_owner** — the developer account. Full access everywhere. Invisible in the client-facing user list, and no other role can modify, demote or delete it.
- **owner** — full access to content, team, settings, inquiries and user management. Can invite and manage `owner` and `editor` accounts. Cannot see or affect platform owners.
- **editor** — projects and blog only. No team, settings, inquiries or users.

`admin` stays in the enum (dropping an enum value in use is destructive), but is retired: the one existing admin account (rutkusmarius@gmail.com) becomes `platform_owner`, and nothing issues `admin` again.

## Per-table decisions

| Table | platform_owner | owner | editor |
|---|---|---|---|
| projects, project_images | full | full | full |
| tags, project_tags, image_tags | full | full | full |
| blog_posts, blog_categories | full | full | full |
| team_members | full | full | none (public read only) |
| site_settings | full | full | none (public read only) |
| leads | full | full | none — no read, no update |
| user_roles | full | full, except platform_owner rows | none |

Public/anon read policies stay exactly as they are; only the write/admin-read side changes.

## Database work

New helper functions (security definer, `search_path = public`):

- `has_role(_user_id, _role)` — plain membership check.
- `is_staff()` — true for `platform_owner`, `owner`, `editor`. Used on projects/blog/tag tables.
- `is_owner()` — true for `platform_owner` and `owner`. Used on team, settings, leads, users.
- `is_platform_owner()` — used to shield platform owner rows.

Then, table by table, every existing `is_admin()` policy is dropped and recreated against the correct helper — no blanket rewrite, each policy restated with its intended audience. `is_admin()` is kept but redefined to mean "owner or platform owner" so the existing DB functions (`set_project_cover`, `list_project_bucket_paths`) keep behaving correctly; `set_project_cover` is switched to `is_staff()` since editors manage project images.

`user_roles` gains write policies for the first time:

- SELECT: owners see all rows except platform_owner rows; platform owners see everything.
- INSERT/UPDATE/DELETE: owners may act on rows whose target user is not a platform owner and whose role is not `platform_owner`; platform owners unrestricted.
- A `BEFORE` trigger blocks any attempt to grant `platform_owner` or touch a platform owner's row from a non-platform-owner session, and blocks removing your own last owner role (lockout guard).

Storage policies on the buckets are reviewed the same way: project/blog buckets open to staff, team-photos/brand-assets/site-images restricted to owners.

## User management

New `/admin/users` page, owners only. Lists accounts with email, role and created date, with platform owner rows filtered out in the database, not the client.

Because auth user listing and creation need service-role access, one edge function `manage-users` handles it, validating the caller's JWT and their role on every call:

- `list` — accounts + roles, platform owners stripped.
- `invite` — sends the auth invitation email **and** returns a copyable invite/action link plus a generated temporary password, since the sending domain isn't verified yet. The role is written to `user_roles` in the same call, after the account exists, so nothing depends on trigger ordering.
- `set_role` — change a user's role.
- `revoke` — remove access (delete role rows; optionally delete the account).

Every branch refuses to read or write platform owner records unless the caller is one.

## UI behaviour

- `useAdminAuth` returns the role, not just "is admin".
- `AdminProtected` takes a required-access prop (`staff` or `owner`); a signed-in editor hitting `/admin/settings`, `/admin/team`, `/admin/inquiries` or `/admin/users` directly gets a refusal screen with a link back to Projects — not the page.
- Sidebar renders every section for every role. Inaccessible items are disabled and muted with a tooltip, e.g. "Only owners can manage settings". The unread inquiry badge is hidden for editors.
- Default admin landing stays Projects, which every role can reach.

## Verification

Signed-in checks against the API, not the UI:

1. As an editor: create a project and a blog post successfully; then direct `select` on `team_members`, `site_settings`, `leads` and `user_roles` returns empty/denied.
2. As an editor: `/admin/settings` in the address bar shows the refusal screen.
3. As an owner: full content, team, settings and inquiries access; the user list contains no platform owner; attempting to update or delete a platform owner's role row is rejected by the trigger; attempting to grant `platform_owner` is rejected.
4. Invite a test user with the editor role and confirm the role landed with no manual correction, then remove the test user.

Anything that cannot be verified with a real signed-in session will be reported as unverified rather than claimed done.
