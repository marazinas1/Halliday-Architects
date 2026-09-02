ALTER TABLE public.site_settings
  DROP COLUMN IF EXISTS hero_image_bucket,
  DROP COLUMN IF EXISTS hero_image_path,
  DROP COLUMN IF EXISTS hero_headline,
  DROP COLUMN IF EXISTS hero_subline;