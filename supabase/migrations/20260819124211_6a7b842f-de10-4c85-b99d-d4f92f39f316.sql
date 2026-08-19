CREATE POLICY "Public can view site images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "Admins can update site images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "Admins can delete site images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin());