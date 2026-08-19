ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_image_bucket text,
  ADD COLUMN IF NOT EXISTS hero_image_path text,
  ADD COLUMN IF NOT EXISTS hero_headline text,
  ADD COLUMN IF NOT EXISTS hero_subline text,
  ADD COLUMN IF NOT EXISTS intro_heading text,
  ADD COLUMN IF NOT EXISTS intro_body text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS projects_featured_sort_idx
  ON public.projects (sort_order)
  WHERE featured;