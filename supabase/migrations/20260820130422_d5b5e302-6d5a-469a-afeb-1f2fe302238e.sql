CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  author_name text NOT NULL,
  author_detail text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published testimonials"
  ON public.testimonials FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Owners can view all testimonials"
  ON public.testimonials FOR SELECT TO authenticated
  USING (is_owner());

CREATE POLICY "Owners can insert testimonials"
  ON public.testimonials FOR INSERT TO authenticated
  WITH CHECK (is_owner());

CREATE POLICY "Owners can update testimonials"
  ON public.testimonials FOR UPDATE TO authenticated
  USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "Owners can delete testimonials"
  ON public.testimonials FOR DELETE TO authenticated
  USING (is_owner());

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();