ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

CREATE INDEX IF NOT EXISTS page_views_session_idx ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS page_views_day_idx ON public.page_views (day);

CREATE OR REPLACE FUNCTION public.analytics_summary(_from date, _to date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  prev_from date := _from - (_to - _from) - 1;
  prev_to date := _from - 1;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  IF _from IS NULL OR _to IS NULL OR _to < _from OR (_to - _from) > 400 THEN
    RAISE EXCEPTION 'invalid date range';
  END IF;

  SELECT jsonb_build_object(
    'totals', (
      SELECT jsonb_build_object(
        'views', count(*),
        'visitors', count(DISTINCT visitor_hash),
        'avg_duration', COALESCE(round(avg(duration_seconds) FILTER (WHERE duration_seconds IS NOT NULL))::int, 0),
        'sessions', count(DISTINCT session_id),
        'pages_per_visit', CASE WHEN count(DISTINCT session_id) = 0 THEN 0
          ELSE round(count(*)::numeric / count(DISTINCT session_id), 2) END,
        'bounce_rate', COALESCE((
          SELECT round(100.0 * count(*) FILTER (WHERE c = 1) / NULLIF(count(*), 0))::int
          FROM (
            SELECT session_id, count(*) AS c FROM public.page_views
            WHERE day BETWEEN _from AND _to AND session_id IS NOT NULL
            GROUP BY session_id
          ) s
        ), 0)
      )
      FROM public.page_views WHERE day BETWEEN _from AND _to
    ),
    'previous', (
      SELECT jsonb_build_object(
        'views', count(*),
        'visitors', count(DISTINCT visitor_hash),
        'avg_duration', COALESCE(round(avg(duration_seconds) FILTER (WHERE duration_seconds IS NOT NULL))::int, 0)
      )
      FROM public.page_views WHERE day BETWEEN prev_from AND prev_to
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
    'referrers', COALESCE((
      SELECT jsonb_agg(row_to_json(r))
      FROM (
        SELECT referrer_host, count(*) AS views FROM public.page_views
        WHERE day BETWEEN _from AND _to AND referrer_host IS NOT NULL
        GROUP BY referrer_host ORDER BY count(*) DESC LIMIT 15
      ) r
    ), '[]'::jsonb),
    'countries', COALESCE((
      SELECT jsonb_agg(row_to_json(c))
      FROM (
        SELECT country, count(*) AS views FROM public.page_views
        WHERE day BETWEEN _from AND _to AND country IS NOT NULL
        GROUP BY country ORDER BY count(*) DESC LIMIT 15
      ) c
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
$function$;

CREATE OR REPLACE FUNCTION public.purge_old_page_views()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  DELETE FROM public.page_views WHERE day < (CURRENT_DATE - INTERVAL '14 months')::date;
$function$;