-- The platform owner always retains full access, so the last-owner guard must
-- not trap them (e.g. removing a temporary owner before the client's own
-- owner account exists). It still applies to every other caller.
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

  IF NOT public.is_platform_owner(auth.uid())
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