CREATE POLICY "Admins can upload brand assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'brand-assets' AND public.is_admin());

CREATE POLICY "Admins can update brand assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'brand-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'brand-assets' AND public.is_admin());

CREATE POLICY "Admins can delete brand assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'brand-assets' AND public.is_admin());