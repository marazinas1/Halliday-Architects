// First-party pageview beacon — ported from the track-view edge function.
// Same-origin now (the beacon posts to /api/track-view on the app domain),
// so no CORS handling is needed; the origin check stays as defence in depth.
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_HOSTS = [
  "hallidayarchitects.com",
  "www.hallidayarchitects.com",
  "ha.stagehomy.com",
  "localhost",
  "127.0.0.1",
];

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|embedly|quora|pinterest|semrush|ahrefs|petal|headless|lighthouse|preview|monitor|curl|wget|python-requests|node-fetch|go-http/i;

/** Only accept pings coming from our own site (or a Lovable preview). */
function originAllowed(request: Request): boolean {
  const raw = request.headers.get("origin") ?? request.headers.get("referer");
  if (!raw) return false;
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (ALLOWED_HOSTS.includes(host)) return true;
  return host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com");
}

function deviceFrom(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Build, preview and local hosts are never real referrals. They are stored as
 * direct traffic with no referring site, and their UTM tags are ignored.
 */
function isInternalHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "lovable.dev" ||
    h.endsWith(".lovable.dev") ||
    h.endsWith(".lovable.app") ||
    h.endsWith(".lovableproject.com") ||
    h.endsWith(".webcontainer.io") ||
    h.endsWith(".gitpod.io") ||
    h.endsWith(".vercel.app") ||
    h.endsWith(".netlify.app")
  );
}

function sourceFrom(host: string | null): string {
  if (!host) return "direct";
  const h = host.toLowerCase();
  if (isInternalHost(h)) return "direct";
  if (h.includes("hallidayarchitects") || h.includes("ha.stagehomy")) return "direct";
  // AI assistants
  if (
    h.includes("chatgpt") ||
    h.includes("openai") ||
    h.includes("perplexity") ||
    h.includes("claude.ai") ||
    h.includes("anthropic") ||
    h.includes("gemini.google") ||
    h.includes("copilot.microsoft")
  )
    return "ai";
  if (h.includes("google")) return "google";
  if (h.includes("bing") || h.includes("duckduckgo") || h.includes("yahoo") || h.includes("ecosia"))
    return "search";
  if (h.includes("facebook") || h.includes("fb.")) return "facebook";
  if (h.includes("instagram")) return "instagram";
  if (h.includes("linkedin")) return "linkedin";
  if (h.includes("pinterest")) return "pinterest";
  if (h.includes("youtube")) return "youtube";
  if (h.includes("houzz") || h.includes("architizer") || h.includes("dezeen")) return "listing";
  return "other";
}


async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const noContent = () => new Response(null, { status: 204 });

export const Route = createFileRoute("/api/track-view")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
    try {
      if (!originAllowed(request)) return noContent();

      const userAgent = request.headers.get("user-agent") ?? "";
      if (!userAgent || BOT_PATTERN.test(userAgent)) return noContent();

      // Body arrives as text/plain (beacon-friendly).
      const raw = await request.text().catch(() => "");
      let body:
        | {
            event?: unknown;
            path?: unknown;
            referrer?: unknown;
            session?: unknown;
            seconds?: unknown;
            utm?: { source?: unknown; medium?: unknown; campaign?: unknown };
          }
        | null = null;
      try {
        body = raw ? JSON.parse(raw) : null;
      } catch {
        body = null;
      }
      if (!body) return noContent();

      const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
      if (!path.startsWith("/") || path.startsWith("/admin")) return noContent();

      const sessionIdValue =
        typeof body.session === "string" ? body.session.slice(0, 64) : null;

      const supabaseClient = createClient(
        process.env["SUPABASE_URL"] ?? "",
        process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "",
        { auth: { persistSession: false } },
      );

      // Second ping of a view: how long the visitor actually stayed.
      if (body.event === "duration") {
        const seconds = typeof body.seconds === "number" ? Math.min(Math.round(body.seconds), 3600) : 0;
        if (!sessionIdValue || seconds < 1) return noContent();
        const { data: existing } = await supabaseClient
          .from("page_views")
          .select("id")
          .eq("session_id", sessionIdValue)
          .eq("path", path)
          .order("created_at", { ascending: false })
          .limit(1);
        const rowId = existing?.[0]?.id;
        if (rowId) {
          await supabaseClient
            .from("page_views")
            .update({ duration_seconds: seconds })
            .eq("id", rowId);
        }
        return noContent();
      }

      const str = (value: unknown) =>
        typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null;

      let referrerHost: string | null = null;
      if (typeof body.referrer === "string" && body.referrer) {
        try {
          referrerHost = new URL(body.referrer).hostname.toLowerCase().slice(0, 200);
        } catch {
          referrerHost = null;
        }
      }
      // Internal navigation is not an acquisition source.
      if (
        referrerHost &&
        (referrerHost.includes("hallidayarchitects") || referrerHost.includes("ha.stagehomy"))
      ) {
        referrerHost = null;
      }

      const salt = process.env["ANALYTICS_SALT"] ?? "";
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("cf-connecting-ip") ??
        "unknown";
      const utcDay = new Date().toISOString().slice(0, 10);
      // One-way, daily-rotating. The raw IP / UA are never persisted.
      const visitorHash = await sha256(`${salt}|${utcDay}|${ip}|${userAgent}`);

      const { error } = await supabaseClient.from("page_views").insert({
        path,
        referrer_host: referrerHost,
        source: sourceFrom(referrerHost),
        device: deviceFrom(userAgent),
        country: request.headers.get("cf-ipcountry") ?? null,
        visitor_hash: visitorHash,
        day: utcDay,
        session_id: sessionIdValue,
        utm_source: str(body.utm?.source),
        utm_medium: str(body.utm?.medium),
        utm_campaign: str(body.utm?.campaign),
      });
      if (error) console.error("track-view insert failed:", error.message);


    } catch (err) {
      console.error("track-view error:", err instanceof Error ? err.message : String(err));
    }

        // Always silent — tracking must never affect the public site.
        return noContent();
      },
    },
  },
});
