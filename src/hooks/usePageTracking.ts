import { useEffect, useRef } from "react";
import { useLocation } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

// Same-origin server route (was the track-view edge function).
const ENDPOINT = "/api/track-view";
const SESSION_KEY = "ha_sid";
const UTM_KEY = "ha_utm";
/** A visit only counts after this long on the page, or after real interaction. */
const ENGAGEMENT_MS = 5000;

type Utm = { source?: string; medium?: string; campaign?: string };

function sessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** UTM tags are read once, on the first page of the visit, and reused after. */
function utmForVisit(): Utm {
  const stored = sessionStorage.getItem(UTM_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Utm;
    } catch {
      return {};
    }
  }
  const params = new URLSearchParams(window.location.search);
  const utm: Utm = {};
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");
  if (source) utm.source = source;
  if (medium) utm.medium = medium;
  if (campaign) utm.campaign = campaign;
  sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  return utm;
}

function send(payload: unknown) {
  const body = JSON.stringify(payload);
  try {
    const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
    if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
  } catch {
    /* fall through to fetch */
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never break the page */
  });
}

/**
 * Cookie-free, first-party pageview tracking.
 *
 * A view is only recorded after real engagement (five seconds, or a scroll,
 * click or keypress — whichever comes first), so a bounce off the wrong link
 * is not counted as a visitor. Time on page is sent when the visitor leaves.
 * Admin routes and signed-in staff are never tracked, so the client
 * refreshing their own site does not inflate their numbers.
 */
export function usePageTracking() {
  const { pathname } = useLocation();
  const staff = useRef<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) staff.current = Boolean(data.session);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const startedAt = Date.now();
    let recorded = false;
    let timer: number | undefined;

    const record = () => {
      if (recorded || staff.current) return;
      recorded = true;
      cleanupEngagement();
      const utm = utmForVisit();
      send({
        event: "view",
        path: pathname,
        referrer: document.referrer,
        session: sessionId(),
        utm,
      });
    };

    const onInteract = () => record();
    function cleanupEngagement() {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
    }

    timer = window.setTimeout(record, ENGAGEMENT_MS);
    window.addEventListener("scroll", onInteract, { passive: true, once: true });
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });

    const sendDuration = () => {
      if (!recorded) return;
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (seconds < 1) return;
      send({ event: "duration", path: pathname, session: sessionId(), seconds });
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cleanupEngagement();
      document.removeEventListener("visibilitychange", onHide);
      sendDuration();
    };
  }, [pathname]);
}
