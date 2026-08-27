import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AnalyticsRange = 7 | 30 | 90;

export interface AnalyticsSummary {
  totals: { views: number; visitors: number };
  previous: { views: number; visitors: number };
  daily: { day: string; views: number; visitors: number }[];
  top_pages: { path: string; views: number }[];
  sources: { source: string; views: number }[];
  devices: { device: string; views: number }[];
  leads: number;
}

const EMPTY: AnalyticsSummary = {
  totals: { views: 0, visitors: 0 },
  previous: { views: 0, visitors: 0 },
  daily: [],
  top_pages: [],
  sources: [],
  devices: [],
  leads: 0,
};

function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Aggregated first-party analytics. Admin-only at the database level. */
export function useAnalytics(range: AnalyticsRange, enabled = true) {
  return useQuery({
    queryKey: ["admin-analytics", range],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data, error } = await (supabase.rpc as any)("analytics_summary", {
        _from: isoDay(range - 1),
        _to: isoDay(0),
      });
      if (error) throw error;
      return { ...EMPTY, ...((data as AnalyticsSummary | null) ?? {}) };
    },
  });
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}
