-- Move the developer account onto the new role value. The guard trigger blocks
-- any change to a developer row, so it is paused for this single statement and
-- re-enabled immediately after.
ALTER TABLE public.user_roles DISABLE TRIGGER guard_user_roles_changes;
UPDATE public.user_roles SET role = 'developer' WHERE role = 'platform_owner';
ALTER TABLE public.user_roles ENABLE TRIGGER guard_user_roles_changes;

-- Rewrite the role helpers to compare against 'developer'.
CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'developer')
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('developer','owner')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('developer','owner')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('developer','owner','editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  remaining int;
  service boolean := coalesce(auth.role(), '') = 'service_role';
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') AND OLD.role = 'developer' AND NOT public.is_platform_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Developer accounts cannot be modified.';
  END IF;

  IF TG_OP IN ('INSERT','UPDATE') AND NEW.role = 'developer'
     AND NOT public.is_platform_owner(auth.uid()) AND NOT service THEN
    RAISE EXCEPTION 'The developer role cannot be granted.';
  END IF;

  IF NOT public.is_platform_owner(auth.uid()) AND NOT service
     AND ((TG_OP = 'DELETE' AND OLD.role = 'owner')
          OR (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role <> 'owner')) THEN
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