-- The notify secret never leaves the database: the new /api/public/notify-inquiry
-- route verifies the caller's header through this function instead of reading
-- the value into the app process. Comparison walks the full length so timing
-- does not leak prefix matches.
CREATE OR REPLACE FUNCTION public.verify_notify_secret(_provided text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  expected text := current_setting('app.notify_inquiry_secret', true);
  i int;
  diff int := 0;
  len int;
BEGIN
  IF expected IS NULL OR _provided IS NULL THEN
    RETURN false;
  END IF;
  len := greatest(length(expected), length(_provided));
  diff := length(expected) # length(_provided);
  FOR i IN 1..len LOOP
    diff := diff | (coalesce(ascii(substr(expected, i, 1)), 0) # coalesce(ascii(substr(_provided, i, 1)), 0));
  END LOOP;
  RETURN diff = 0;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_notify_secret(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_notify_secret(text) TO service_role;

-- Point the lead-notification trigger at the app's own API route (stable
-- production URL) instead of the retired edge function.
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $function$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://project--98df5051-49a4-4327-a652-f8f260ffe450.lovable.app/api/public/notify-inquiry',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-notify-secret', current_setting('app.notify_inquiry_secret', true)
      ),
      body := jsonb_build_object('leadId', NEW.id)
    );
  EXCEPTION WHEN OTHERS THEN
    -- A dispatch problem must never lose the enquiry, but it must leave a trace.
    UPDATE public.leads
       SET notify_error = 'Dispatch failed: ' || SQLERRM
     WHERE id = NEW.id;
  END;
  RETURN NEW;
END;
$function$;

-- Standard role helper names, aliasing the existing checks. New code uses
-- these; existing policies keep their current names.
CREATE OR REPLACE FUNCTION public.is_developer(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_platform_owner(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_owner(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_admin_staff(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_staff(_user_id)
$$;