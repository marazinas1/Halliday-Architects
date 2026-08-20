-- ============================================================
-- Role helpers
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'platform_owner')
$$;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('platform_owner','owner')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('platform_owner','owner','editor')
  )
$$;

-- Kept for compatibility with existing functions; now means owner or platform owner.
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('platform_owner','owner')
  )
$$;

-- Retire the legacy admin role: the developer account becomes platform_owner.
UPDATE public.user_roles SET role = 'platform_owner' WHERE role = 'admin';

-- ============================================================
-- Content tables: staff (editor, owner, platform_owner)
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
CREATE POLICY "Staff can view all projects" ON public.projects FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Staff can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Admins can view all project images" ON public.project_images;
DROP POLICY IF EXISTS "Admins can insert project images" ON public.project_images;
DROP POLICY IF EXISTS "Admins can update project images" ON public.project_images;
DROP POLICY IF EXISTS "Admins can delete project images" ON public.project_images;
CREATE POLICY "Staff can view all project images" ON public.project_images FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can insert project images" ON public.project_images FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_images.project_id));
CREATE POLICY "Staff can update project images" ON public.project_images FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_images.project_id));
CREATE POLICY "Staff can delete project images" ON public.project_images FOR DELETE TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON public.tags;
CREATE POLICY "Staff can insert tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Staff can update tags" ON public.tags FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff can delete tags" ON public.tags FOR DELETE TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Admins can view all project tags" ON public.project_tags;
DROP POLICY IF EXISTS "Admins can insert project tags" ON public.project_tags;
DROP POLICY IF EXISTS "Admins can update project tags" ON public.project_tags;
DROP POLICY IF EXISTS "Admins can delete project tags" ON public.project_tags;
CREATE POLICY "Staff can view all project tags" ON public.project_tags FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can insert project tags" ON public.project_tags FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Staff can update project tags" ON public.project_tags FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff can delete project tags" ON public.project_tags FOR DELETE TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Admins can view all image tags" ON public.image_tags;
DROP POLICY IF EXISTS "Admins can insert image tags" ON public.image_tags;
DROP POLICY IF EXISTS "Admins can update image tags" ON public.image_tags;
DROP POLICY IF EXISTS "Admins can delete image tags" ON public.image_tags;
CREATE POLICY "Staff can view all image tags" ON public.image_tags FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can insert image tags" ON public.image_tags FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Staff can update image tags" ON public.image_tags FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff can delete image tags" ON public.image_tags FOR DELETE TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Admins can view all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
CREATE POLICY "Staff can view all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Staff can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Admins can insert blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Admins can update blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Admins can delete blog categories" ON public.blog_categories;
CREATE POLICY "Staff can insert blog categories" ON public.blog_categories FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY "Staff can update blog categories" ON public.blog_categories FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Staff can delete blog categories" ON public.blog_categories FOR DELETE TO authenticated USING (public.is_staff());

-- ============================================================
-- Owner-only tables
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON public.team_members;
CREATE POLICY "Owners can view all team members" ON public.team_members FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "Owners can insert team members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (public.is_owner());
CREATE POLICY "Owners can update team members" ON public.team_members FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Owners can delete team members" ON public.team_members FOR DELETE TO authenticated USING (public.is_owner());

DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON public.site_settings;
CREATE POLICY "Owners can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_owner());
CREATE POLICY "Owners can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "Owners can delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (public.is_owner());

DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Owners can read leads" ON public.leads FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "Owners can update leads" ON public.leads FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ============================================================
-- user_roles: owners manage everyone except platform owners
-- ============================================================
DROP POLICY IF EXISTS "Admins can read roles" ON public.user_roles;
CREATE POLICY "Owners can read roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_platform_owner() OR (public.is_owner() AND NOT public.is_platform_owner(user_roles.user_id)));
CREATE POLICY "Owners can grant roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_owner() OR (public.is_owner() AND role <> 'platform_owner' AND NOT public.is_platform_owner(user_roles.user_id)));
CREATE POLICY "Owners can change roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_platform_owner() OR (public.is_owner() AND NOT public.is_platform_owner(user_roles.user_id)))
  WITH CHECK (public.is_platform_owner() OR (public.is_owner() AND role <> 'platform_owner' AND NOT public.is_platform_owner(user_roles.user_id)));
CREATE POLICY "Owners can revoke roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_platform_owner() OR (public.is_owner() AND NOT public.is_platform_owner(user_roles.user_id)));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Guard: shield platform owners, and never leave the site without an owner.
CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  remaining int;
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') AND OLD.role = 'platform_owner' AND NOT public.is_platform_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Platform owner accounts cannot be modified.';
  END IF;

  IF TG_OP IN ('INSERT','UPDATE') AND NEW.role = 'platform_owner' AND NOT public.is_platform_owner(auth.uid()) THEN
    RAISE EXCEPTION 'The platform owner role cannot be granted.';
  END IF;

  -- Last-owner protection: at least one non-platform owner account must keep the owner role.
  IF (TG_OP = 'DELETE' AND OLD.role = 'owner')
     OR (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role <> 'owner') THEN
    SELECT count(*) INTO remaining
      FROM public.user_roles r
     WHERE r.role = 'owner' AND r.id <> OLD.id;
    IF remaining = 0 THEN
      RAISE EXCEPTION 'At least one owner account must remain.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_user_roles_changes ON public.user_roles;
CREATE TRIGGER guard_user_roles_changes
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_roles();

-- ============================================================
-- Storage: content buckets open to staff, brand buckets owner-only
-- ============================================================
DROP POLICY IF EXISTS "Admins can read project images objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update project images objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project images objects" ON storage.objects;
CREATE POLICY "Staff can read project images objects" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'project-images' AND public.is_staff());
CREATE POLICY "Staff can upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.is_staff());
CREATE POLICY "Staff can update project images objects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.is_staff()) WITH CHECK (bucket_id = 'project-images' AND public.is_staff());
CREATE POLICY "Staff can delete project images objects" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.is_staff());

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Staff can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images' AND public.is_staff());
CREATE POLICY "Staff can update blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-images' AND public.is_staff()) WITH CHECK (bucket_id = 'blog-images' AND public.is_staff());
CREATE POLICY "Staff can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images' AND public.is_staff());

DROP POLICY IF EXISTS "Admins can upload team photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update team photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete team photos" ON storage.objects;
CREATE POLICY "Owners can upload team photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'team-photos' AND public.is_owner());
CREATE POLICY "Owners can update team photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'team-photos' AND public.is_owner()) WITH CHECK (bucket_id = 'team-photos' AND public.is_owner());
CREATE POLICY "Owners can delete team photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'team-photos' AND public.is_owner());

DROP POLICY IF EXISTS "Admins can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete brand assets" ON storage.objects;
CREATE POLICY "Owners can upload brand assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-assets' AND public.is_owner());
CREATE POLICY "Owners can update brand assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand-assets' AND public.is_owner()) WITH CHECK (bucket_id = 'brand-assets' AND public.is_owner());
CREATE POLICY "Owners can delete brand assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-assets' AND public.is_owner());

DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;
CREATE POLICY "Owners can upload site images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.is_owner());
CREATE POLICY "Owners can update site images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.is_owner()) WITH CHECK (bucket_id = 'site-images' AND public.is_owner());
CREATE POLICY "Owners can delete site images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.is_owner());

-- Editors manage project images, so cover selection must allow staff.
CREATE OR REPLACE FUNCTION public.set_project_cover(_project_id uuid, _image_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  UPDATE public.project_images
     SET is_cover = false
   WHERE project_id = _project_id AND is_cover AND (_image_id IS NULL OR id <> _image_id);

  IF _image_id IS NOT NULL THEN
    UPDATE public.project_images
       SET is_cover = true
     WHERE id = _image_id AND project_id = _project_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_project_bucket_paths(_slug text)
RETURNS TABLE(name text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, storage AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RETURN;
  END IF;
  IF _slug IS NULL OR _slug !~ '^[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'invalid slug: %', _slug;
  END IF;
  RETURN QUERY
    SELECT o.name
    FROM storage.objects o
    WHERE o.bucket_id = 'project-images'
      AND o.name LIKE _slug || '/%';
END;
$$;