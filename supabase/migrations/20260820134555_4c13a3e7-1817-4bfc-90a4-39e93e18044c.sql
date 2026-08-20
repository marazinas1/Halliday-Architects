CREATE OR REPLACE FUNCTION public.notify_new_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://cbngutdwgciuvpbzpmoy.supabase.co/functions/v1/notify-inquiry',
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

REVOKE ALL ON FUNCTION public.notify_new_lead() FROM PUBLIC, anon, authenticated;