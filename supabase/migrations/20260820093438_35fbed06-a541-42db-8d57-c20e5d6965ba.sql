-- Trigger-only functions must not be callable through the API.
REVOKE ALL ON FUNCTION public.guard_user_roles() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_new_lead() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Role checks are needed by RLS for signed-in users, but never by anonymous visitors.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_owner(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_owner(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_project_cover(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_project_bucket_paths(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_project_cover(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_project_bucket_paths(text) TO authenticated;