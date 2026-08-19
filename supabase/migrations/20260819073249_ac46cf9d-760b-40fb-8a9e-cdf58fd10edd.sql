-- 1. Cover flag on project images
ALTER TABLE public.project_images
  ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS project_images_one_cover_per_project
  ON public.project_images (project_id)
  WHERE is_cover;

-- Atomically move the cover flag within a project.
CREATE OR REPLACE FUNCTION public.set_project_cover(_project_id uuid, _image_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
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

REVOKE ALL ON FUNCTION public.set_project_cover(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.set_project_cover(uuid, uuid) TO authenticated;

-- 2. Storage policies for the new project-images bucket
CREATE POLICY "Admins can read project images objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-images' AND public.is_admin());

CREATE POLICY "Admins can upload project images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-images' AND public.is_admin());

CREATE POLICY "Admins can update project images objects"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'project-images' AND public.is_admin());

CREATE POLICY "Admins can delete project images objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-images' AND public.is_admin());

-- 3. Admin listing helper against the new bucket
CREATE OR REPLACE FUNCTION public.list_project_bucket_paths(_slug text)
RETURNS TABLE(name text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
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

REVOKE ALL ON FUNCTION public.list_project_bucket_paths(text) FROM public;
GRANT EXECUTE ON FUNCTION public.list_project_bucket_paths(text) TO authenticated;

-- 4. Retire the inherited, empty property-images bucket
DROP POLICY IF EXISTS "Admins can read property images objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete property images objects" ON storage.objects;
DROP FUNCTION IF EXISTS public.list_property_bucket_paths(text);