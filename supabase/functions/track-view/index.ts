import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
function originAllowed(req: Request): boolean {
  const raw = req.headers.get("origin") ?? req.headers.get("referer");
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

function sourceFrom(host: string | null): string {
  if (!host) return "direct";
  const h = host.toLowerCase();
  if (h.includes("google")) return "google";
  if (h.includes("bing") || h.includes("duckduckgo") || h.includes("yahoo")) return "search";
  if (h.includes("facebook") || h.includes("fb.")) return "facebook";
  if (h.includes("instagram")) return "instagram";
  if (h.includes("linkedin")) return "linkedin";
  if (h.includes("houzz")) return "houzz";
  if (h.includes("hallidayarchitects") || h.includes("ha.stagehomy")) return "direct";
  return "other";
}

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const noContent = () => new Response(null, { status: 204, headers: corsHeaders });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return noContent();

  try {
    if (!originAllowed(req)) return noContent();

    const userAgent = req.headers.get("user-agent") ?? "";
    if (!userAgent || BOT_PATTERN.test(userAgent)) return noContent();

    // Body arrives as text/plain (simple CORS request — no preflight drop).
    const raw = await req.text().catch(() => "");
    let body: { path?: unknown; referrer?: unknown } | null = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      body = null;
    }
    if (!body) return noContent();


    const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
    if (!path.startsWith("/") || path.startsWith("/admin")) return noContent();

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

    const salt = Deno.env.get("ANALYTICS_SALT") ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown";
    const utcDay = new Date().toISOString().slice(0, 10);
    // One-way, daily-rotating. The raw IP / UA are never persisted.
    const visitorHash = await sha256(`${salt}|${utcDay}|${ip}|${userAgent}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { error } = await supabase.from("page_views").insert({
      path,
      referrer_host: referrerHost,
      source: sourceFrom(referrerHost),
      device: deviceFrom(userAgent),
      country: req.headers.get("cf-ipcountry") ?? null,
      visitor_hash: visitorHash,
      day: utcDay,
    });
    if (error) console.error("track-view insert failed:", error.message);
  } catch (err) {
    console.error("track-view error:", err instanceof Error ? err.message : String(err));
  }

  // Always silent — tracking must never affect the public site.
  return noContent();
});
