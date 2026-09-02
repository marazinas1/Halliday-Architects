CREATE TABLE public.page_media_defaults (
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

GRANT SELECT ON public.page_media_defaults TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_media_defaults TO authenticated;
GRANT ALL ON public.page_media_defaults TO service_role;

ALTER TABLE public.page_media_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view page media defaults"
  ON public.page_media_defaults FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Developers can insert page media defaults"
  ON public.page_media_defaults FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_owner(auth.uid()));

CREATE POLICY "Developers can update page media defaults"
  ON public.page_media_defaults FOR UPDATE
  TO authenticated
  USING (public.is_platform_owner(auth.uid()))
  WITH CHECK (public.is_platform_owner(auth.uid()));

CREATE POLICY "Developers can delete page media defaults"
  ON public.page_media_defaults FOR DELETE
  TO authenticated
  USING (public.is_platform_owner(auth.uid()));

CREATE TRIGGER update_page_media_defaults_updated_at
  BEFORE UPDATE ON public.page_media_defaults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();