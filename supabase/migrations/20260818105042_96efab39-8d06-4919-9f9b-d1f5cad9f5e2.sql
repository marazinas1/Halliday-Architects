CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  credentials text,
  bio text,
  photo_path text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published team members"
  ON public.team_members FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins can view all team members"
  ON public.team_members FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update team members"
  ON public.team_members FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete team members"
  ON public.team_members FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX team_members_sort_order_idx ON public.team_members (sort_order);

CREATE POLICY "Admins can upload team photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'team-photos' AND public.is_admin());

CREATE POLICY "Admins can update team photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'team-photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'team-photos' AND public.is_admin());

CREATE POLICY "Admins can delete team photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'team-photos' AND public.is_admin());

CREATE POLICY "Anyone can read team photos"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'team-photos');