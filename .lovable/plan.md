# Blog module

A full blog for the practice: image-led posts, client-managed categories, a comfortable writing experience in admin, and public pages that read like part of this site rather than a bolted-on module.

## Data model

`blog_categories` — name, slug, sort_order, created_at. Managed in admin so the client defines his own topics. No categories seeded from our side.

`blog_posts` — title, slug (unique), excerpt, body (HTML), cover_path, category_id (nullable, set null on category delete), published, published_at, created_at, updated_at.

Storage bucket `blog-images`, public read, admin-only write. Holds both cover images and images placed inside post bodies, under `covers/` and `body/` prefixes.

RLS mirrors the existing tables:
- Categories: public read, admin write.
- Posts: public read only where `published = true`; admins full access.
- Grants: `anon` gets SELECT only; `authenticated` full CRUD; `service_role` all.

Draft invisibility is verified by querying the posts table as an anonymous client after inserting an unpublished post — not assumed.

## Rich text editor

TipTap (StarterKit + Link + Image) in a new `src/components/admin/RichTextEditor.tsx`, storing HTML. Restrained toolbar: H2, H3, bold, italic, link, bullet list, numbered list, blockquote, image, undo/redo.

Inline images go through the existing `optimizeImage` pipeline (`project` preset, WebP) via a new `src/lib/admin/uploadBlogImage.ts`, the same path as every other upload.

Storage cleanup on delete: body HTML is scanned for `blog-images` URLs, and those paths plus the cover are removed from storage before the row is deleted — the same fail-first ordering used for team photos.

## Admin

`/admin/blog` — list with cover thumbnail, title, category, status badge (Draft in muted stone, Published in ink), published date, edit and delete.

`/admin/blog/new` and `/admin/blog/:id/edit` — title with auto slug (overridable, availability-checked like projects), excerpt, category selector, cover upload with progress, rich text body, publish toggle. Publishing stamps `published_at` the first time.

Preview: a toggle in the form that renders the post exactly as the public detail page will, using the same shared components.

`/admin/blog/categories` — add, rename, reorder, delete categories. Reachable as a secondary link from the Blog list header.

Sidebar: Blog replaces its "coming soon" placeholder; Inquiries stays as-is.

## Public pages

`/blog` — reverse chronological published posts, image-led cards (cover, category, date, title, excerpt), category filter row. Intentional empty state matching the projects page.

`/blog/:slug` — cover image full-bleed, then title, date and category, then the body at narrow editorial measure. Typography styles for headings, blockquotes, lists and inline images are defined once in a `prose`-style block; body images are allowed to break wider than the text column. Ends with two or three other recent posts. 404 for unknown or unpublished slugs.

Blog is added to the main navigation, and the sitemap generator picks up published post URLs.

## Footer

A small, low-contrast "Admin" link in the footer bottom row next to the copyright, linking to `/admin`.

## Technical notes

- New dependency: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`.
- New files: `src/components/admin/RichTextEditor.tsx`, `src/lib/admin/uploadBlogImage.ts`, `src/hooks/admin/useAdminBlog.ts`, `src/hooks/admin/useBlogCategories.ts`, `src/hooks/usePublicBlog.ts`, `src/pages/admin/AdminBlog.tsx`, `AdminBlogForm.tsx`, `AdminBlogCategories.tsx`, `src/pages/BlogPage.tsx`, `src/pages/BlogPostPage.tsx`, `src/components/blog/PostBody.tsx`, `PostCard.tsx`.
- Edited: `src/App.tsx` (routes), `AdminSidebar.tsx`, `GlobalNav.tsx`, `GlobalFooter.tsx`, `scripts/generate-sitemap.ts`.
- All spacing from `src/lib/rhythm.ts`; Newsreader headings, Inter body; red only for link hover and small markers.

## Verification

Draft hidden from anonymous reads but listed in admin; publishing surfaces it on `/blog` immediately; inline image uploads land as optimised WebP; deleting a post clears cover and body images from storage; index and detail render cleanly at 1280px and 390px.
