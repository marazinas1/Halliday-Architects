import { useEffect, useRef } from "react";
import { useLocation } from "@/lib/router-compat";

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-view`;

/**
 * Fire-and-forget first-party pageview ping. No cookies, no storage,
 * admin routes are never tracked and failures are swallowed.
 *
 * The payload is sent as text/plain so the request stays a "simple" CORS
 * request. A JSON content type forces a preflight, and beacons that need a
 * preflight are silently dropped by browsers — which is why pings never landed.
 */
export function usePageTracking() {
  const { pathname } = useLocation();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });

    try {
      const blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
    } catch {
      /* fall through to fetch */
    }

    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      /* analytics must never break the page */
    });
  }, [pathname]);
}
