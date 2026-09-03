import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, Users, Inbox, TrendingUp, TrendingDown } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalytics, percentChange, type AnalyticsRange } from "@/hooks/admin/useAnalytics";

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const SOURCE_LABEL: Record<string, string> = {
  direct: "Direct",
  google: "Google",
  search: "Other search",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  houzz: "Houzz",
  other: "Other sites",
};

const DEVICE_LABEL: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  unknown: "Unknown",
};

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: string | number;
  change?: number | null;
  icon: typeof Eye;
  suffix?: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="border border-line bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-stone">{label}</p>
        <Icon className="h-4 w-4 text-stone" />
      </div>
      <p className="mt-3 text-3xl font-light tabular-nums text-ink">
        {value}
        {suffix && <span className="text-lg text-stone">{suffix}</span>}
      </p>
      {change !== undefined && change !== null && (
        <p className={`mt-2 flex items-center gap-1 text-xs ${positive ? "text-ink" : "text-brand"}`}>
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {positive ? "+" : ""}
          {change}% vs previous period
        </p>
      )}
    </div>
  );
}

function BreakdownList({
  title,
  rows,
  total,
  empty,
}: {
  title: string;
  rows: { label: string; views: number }[];
  total: number;
  empty: string;
}) {
  return (
    <div className="border border-line bg-card p-5">
      <h2 className="text-sm font-medium text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-stone">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pr-3 text-stone">{row.label}</span>
                <span className="shrink-0 tabular-nums text-ink">{row.views}</span>
              </div>
              <Progress value={total ? (row.views / total) * 100 : 0} className="mt-1.5 h-1" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnalyticsInner() {
  const [range, setRange] = useState<AnalyticsRange>(30);
  const { data, isLoading, error } = useAnalytics(range);

  const chartData = useMemo(() => {
    const byDay = new Map((data?.daily ?? []).map((d) => [d.day, d]));
    const out: { day: string; label: string; views: number; visitors: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const row = byDay.get(key);
      out.push({
        day: key,
        label: shortDay(key),
        views: Number(row?.views ?? 0),
        visitors: Number(row?.visitors ?? 0),
      });
    }
    return out;
  }, [data, range]);

  const totalViews = Number(data?.totals?.views ?? 0);
  const totalVisitors = Number(data?.totals?.visitors ?? 0);
  const leads = Number(data?.leads ?? 0);
  const conversion = totalVisitors ? ((leads / totalVisitors) * 100).toFixed(1) : "0.0";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-stone">
            First-party traffic data. No cookies, no third-party tracking.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              type="button"
              size="sm"
              variant={range === r.value ? "default" : "outline"}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border border-line bg-card p-4 text-sm text-brand">
          Could not load analytics. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {isLoading ? (
        <div className="border border-line bg-card p-10 text-center text-sm text-stone">
          Loading analytics…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Page views"
              value={totalViews}
              change={percentChange(totalViews, Number(data?.previous?.views ?? 0))}
              icon={Eye}
            />
            <StatCard
              label="Unique visitors"
              value={totalVisitors}
              change={percentChange(totalVisitors, Number(data?.previous?.visitors ?? 0))}
              icon={Users}
            />
            <StatCard label="Inquiries" value={leads} icon={Inbox} />
            <StatCard label="Conversion" value={conversion} suffix="%" icon={TrendingUp} />
          </div>

          <div className="mt-6 border border-line bg-card p-5">
            <h2 className="mb-4 text-sm font-medium text-ink">Traffic</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--ink))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--ink))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--stone))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--stone))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--stone))" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--stone))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0 }} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="hsl(var(--ink))"
                    fill="url(#views)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name="Visitors"
                    stroke="hsl(var(--stone))"
                    fill="url(#visitors)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <BreakdownList
              title="Top pages"
              total={totalViews}
              empty="No page views recorded yet."
              rows={(data?.top_pages ?? []).map((p) => ({ label: p.path, views: Number(p.views) }))}
            />
            <BreakdownList
              title="Traffic sources"
              total={totalViews}
              empty="No sources recorded yet."
              rows={(data?.sources ?? []).map((s) => ({
                label: SOURCE_LABEL[s.source] ?? s.source,
                views: Number(s.views),
              }))}
            />
            <BreakdownList
              title="Devices"
              total={totalViews}
              empty="No devices recorded yet."
              rows={(data?.devices ?? []).map((d) => ({
                label: DEVICE_LABEL[d.device] ?? d.device,
                views: Number(d.views),
              }))}
            />
          </div>

          {totalViews === 0 && (
            <p className="mt-6 text-sm text-stone">
              Data starts collecting as soon as this update is live on the public site. Visits to{" "}
              <Link to="/" className="underline underline-offset-4">
                the website
              </Link>{" "}
              will appear here within a minute.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <AdminProtected access="owner">
      <AnalyticsInner />
    </AdminProtected>
  );
}
