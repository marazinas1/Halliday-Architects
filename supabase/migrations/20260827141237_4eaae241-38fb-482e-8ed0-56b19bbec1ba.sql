CREATE TABLE public.page_views (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path          text NOT NULL,
  referrer_host text,
  source        text NOT NULL DEFAULT 'direct',
  device        text NOT NULL DEFAULT 'unknown',
  country       text,
  visitor_hash  text NOT NULL,
  day           date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX page_views_day_idx        ON public.page_views (day);
CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_path_idx       ON public.page_views (path);
CREATE INDEX page_views_visitor_idx    ON public.page_views (day, visitor_hash);

GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL    ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can manage page views"
  ON public.page_views FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.analytics_summary(_from date, _to date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  IF _from IS NULL OR _to IS NULL OR _to < _from OR (_to - _from) > 400 THEN
    RAISE EXCEPTION 'invalid date range';
  END IF;

  SELECT jsonb_build_object(
    'totals', (
      SELECT jsonb_build_object('views', count(*), 'visitors', count(DISTINCT visitor_hash))
      FROM public.page_views WHERE day BETWEEN _from AND _to
    ),
    'previous', (
      SELECT jsonb_build_object('views', count(*), 'visitors', count(DISTINCT visitor_hash))
      FROM public.page_views
      WHERE day BETWEEN (_from - (_to - _from) - 1) AND (_from - 1)
    ),
    'daily', COALESCE((
      SELECT jsonb_agg(row_to_json(d) ORDER BY d.day)
      FROM (
        SELECT day, count(*) AS views, count(DISTINCT visitor_hash) AS visitors
        FROM public.page_views WHERE day BETWEEN _from AND _to GROUP BY day
      ) d
    ), '[]'::jsonb),
    'top_pages', COALESCE((
      SELECT jsonb_agg(row_to_json(p))
      FROM (
        SELECT path, count(*) AS views FROM public.page_views
        WHERE day BETWEEN _from AND _to GROUP BY path ORDER BY count(*) DESC LIMIT 15
      ) p
    ), '[]'::jsonb),
    'sources', COALESCE((
      SELECT jsonb_agg(row_to_json(s))
      FROM (
        SELECT source, count(*) AS views FROM public.page_views
        WHERE day BETWEEN _from AND _to GROUP BY source ORDER BY count(*) DESC
      ) s
    ), '[]'::jsonb),
    'devices', COALESCE((
      SELECT jsonb_agg(row_to_json(v))
      FROM (
        SELECT device, count(*) AS views FROM public.page_views
        WHERE day BETWEEN _from AND _to GROUP BY device
      ) v
    ), '[]'::jsonb),
    'leads', (
      SELECT count(*) FROM public.leads WHERE created_at::date BETWEEN _from AND _to
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.analytics_summary(date, date) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.analytics_summary(date, date) TO authenticated;