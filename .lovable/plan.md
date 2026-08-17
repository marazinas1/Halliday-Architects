# Projects schema reshape + tagging system

Reshape the `projects` table for an architecture practice and add a tag system so imagery can be filtered by design element during client consultations.

## 1. Database migration (structure only, no client data)

Drop from `projects`: `vision_floors`, `vision_headline`, `vision_caption_eyebrow`, `vision_caption_title`, `location_neighborhood`, `location_highlight`, `location_heading`, `location_features`, `map_embed_query`.

Add to `projects`:
- `project_type` text, constrained to `new_build | renovation | interior | addition`, default `new_build`, not null
- `year_completed` integer, nullable
- `story` text, nullable
- `client_brief` text, nullable

Keep `title`, `slug`, `description`, `headline`, `tagline`, `location_city`, `location_state`, `specs`, `features`, `published`, `sort_order`.

## 2. Tagging tables

- `tags` — `id uuid pk`, `name text not null`, `slug text not null unique`, `sort_order int not null default 0`
- `project_tags` — `project_id -> projects.id`, `tag_id -> tags.id`, both `on delete cascade`, composite primary key
- `image_tags` — `image_id -> project_images.id`, `tag_id -> tags.id`, both `on delete cascade`, composite primary key

Grants and RLS mirror the existing `projects` policies:
- `anon`/`authenticated` get SELECT (tags are public; join rows readable when the parent project is published)
- admins (`is_admin()`, authenticated) get insert/update/delete
- `service_role` gets full access

## 3. Tag seed file

`supabase/seed/tags.sql` (not a migration) inserting the starter tags, idempotent on slug: kitchens, bathrooms, staircases, decks, porches, facades, interiors, lighting, built-ins, outdoor living. (The brief listed "kitchens" twice — seeded once.)

## 4. Admin project form

In `src/pages/admin/AdminProjectForm.tsx`: remove the inputs, form state, load mapping and save payload entries for all nine removed fields, and add:
- Project type select (four options)
- Year completed number input
- Client brief textarea
- Story textarea (long form)

## 5. Clean up code references to removed fields

- `src/hooks/usePublicProjects.ts` — `formatLocation` drops `location_neighborhood`, and the card select list is updated
- Any project page section still reading vision/location-highlight/map fields is removed with its data

Regenerate the database types afterwards.

## Verification

Typecheck, then load the admin project form (create + edit), save a project, and confirm the projects list and a project detail page render. Search the codebase for the nine removed field names — expect zero matches.
