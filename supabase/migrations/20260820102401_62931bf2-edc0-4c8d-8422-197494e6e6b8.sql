-- Staff need to read their own role for the admin UI to work; editors are not
-- allowed to read the roles table at all today, which signs them straight out.
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());