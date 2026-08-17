ALTER TABLE public.projects
  DROP COLUMN IF EXISTS vision_floors,
  DROP COLUMN IF EXISTS vision_headline,
  DROP COLUMN IF EXISTS vision_caption_eyebrow,
  DROP COLUMN IF EXISTS vision_caption_title,
  DROP COLUMN IF EXISTS location_neighborhood,
  DROP COLUMN IF EXISTS location_highlight,
  DROP COLUMN IF EXISTS location_heading,
  DROP COLUMN IF EXISTS location_features,
  DROP COLUMN IF EXISTS map_embed_query;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_type text NOT NULL DEFAULT 'new_build',
  ADD COLUMN IF NOT EXISTS year_completed integer,
  ADD COLUMN IF NOT EXISTS story text,
  ADD COLUMN IF NOT EXISTS client_brief text;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_project_type_check
  CHECK (project_type IN ('new_build','renovation','interior','addition'));

CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags" ON public.tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update tags" ON public.tags FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete tags" ON public.tags FOR DELETE TO authenticated USING (is_admin());

CREATE TABLE public.project_tags (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

CREATE INDEX idx_project_tags_project_id ON public.project_tags(project_id);
CREATE INDEX idx_project_tags_tag_id ON public.project_tags(tag_id);

GRANT SELECT ON public.project_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_tags TO authenticated;
GRANT ALL ON public.project_tags TO service_role;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags of published projects" ON public.project_tags
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_tags.project_id AND p.published = true));
CREATE POLICY "Admins can view all project tags" ON public.project_tags FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert project tags" ON public.project_tags FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update project tags" ON public.project_tags FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete project tags" ON public.project_tags FOR DELETE TO authenticated USING (is_admin());

CREATE TABLE public.image_tags (
  image_id uuid NOT NULL REFERENCES public.project_images(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (image_id, tag_id)
);

CREATE INDEX idx_image_tags_image_id ON public.image_tags(image_id);
CREATE INDEX idx_image_tags_tag_id ON public.image_tags(tag_id);

GRANT SELECT ON public.image_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.image_tags TO authenticated;
GRANT ALL ON public.image_tags TO service_role;
ALTER TABLE public.image_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view image tags of published projects" ON public.image_tags
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.project_images pi
    JOIN public.projects p ON p.id = pi.project_id
    WHERE pi.id = image_tags.image_id AND p.published = true));
CREATE POLICY "Admins can view all image tags" ON public.image_tags FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert image tags" ON public.image_tags FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update image tags" ON public.image_tags FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete image tags" ON public.image_tags FOR DELETE TO authenticated USING (is_admin());