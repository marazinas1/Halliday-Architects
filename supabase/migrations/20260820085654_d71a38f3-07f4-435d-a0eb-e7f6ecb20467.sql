-- 1. Inquiry state + notification outcome
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS project_type text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS notify_error text;

CREATE INDEX IF NOT EXISTS leads_inbox_idx
  ON public.leads (archived_at, read_at, created_at DESC);

-- 2. Admin access (read + update only; archive replaces delete)
GRANT SELECT, UPDATE ON public.leads TO authenticated;

DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
CREATE POLICY "Admins can read leads"
  ON public.leads FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. Configurable notification recipients
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS inquiry_notify_emails text;

-- 4. Notify on insert (never blocks the submission)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://cbngutdwgciuvpbzpmoy.supabase.co/functions/v1/notify-inquiry',
      headers := jsonb_build_object('Content-Type', 'application/json'),
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
$$;

DROP TRIGGER IF EXISTS leads_notify_on_insert ON public.leads;
CREATE TRIGGER leads_notify_on_insert
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_lead();