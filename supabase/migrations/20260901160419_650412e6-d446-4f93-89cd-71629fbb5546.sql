CREATE TABLE public.page_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  bucket text NOT NULL,
  path text NOT NULL,
  alt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, slot)
);
GRANT SELECT ON public.page_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_media TO authenticated;
GRANT ALL ON public.page_media TO service_role;
ALTER TABLE public.page_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view page media" ON public.page_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can insert page media" ON public.page_media FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff can update page media" ON public.page_media FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff can delete page media" ON public.page_media FOR DELETE TO authenticated USING (is_staff());
CREATE TRIGGER update_page_media_updated_at BEFORE UPDATE ON public.page_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.page_text (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, slot)
);
GRANT SELECT ON public.page_text TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_text TO authenticated;
GRANT ALL ON public.page_text TO service_role;
ALTER TABLE public.page_text ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view page text" ON public.page_text FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can insert page text" ON public.page_text FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff can update page text" ON public.page_text FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff can delete page text" ON public.page_text FOR DELETE TO authenticated USING (is_staff());
CREATE TRIGGER update_page_text_updated_at BEFORE UPDATE ON public.page_text FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  includes jsonb NOT NULL DEFAULT '[]'::jsonb,
  icon text,
  image_bucket text,
  image_path text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published services" ON public.services FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff can view all services" ON public.services FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff can update services" ON public.services FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff can delete services" ON public.services FOR DELETE TO authenticated USING (is_staff());
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();