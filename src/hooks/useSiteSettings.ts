import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBrandAssetUrl } from "@/lib/admin/uploadBrandAsset";
import { FIRM } from "@/content/firm";
import fallbackLogo from "@/assets/halliday-logo.png";

export const SITE_SETTINGS_KEY = ["site-settings"];

/**
 * Homepage copy the client has not overridden yet. Every editable homepage
 * field falls back to one of these, so the page can never render blank.
 */
export const HOMEPAGE_FALLBACKS = {
  introHeading:
    "We approach design as a response to the local vernacular, to new building technology, and to the way the spaces of a house work together.",
  introBody:
    "The practice has worked along the New Jersey shore since 2013, on new houses, additions and renovations. Both principals are registered architects and LEED accredited professionals, and both stay with a project from the first site visit through construction — which is also how energy performance, flood elevation and salt-air durability get resolved as part of the design rather than after it.",
} as const;

export type SiteSettingsRow = {
  id: string;
  site_name: string;
  logo_path: string | null;
  logo_dark_path: string | null;
  favicon_path: string | null;
  intro_heading: string | null;
  intro_body: string | null;
  inquiry_notify_emails: string | null;
};

const SETTINGS_COLUMNS =
  "id, site_name, logo_path, logo_dark_path, favicon_path, intro_heading, intro_body, inquiry_notify_emails";

export type HomepageContent = {
  introHeading: string;
  introBody: string;
};

const trimmed = (value: string | null | undefined, fallback: string) =>
  value && value.trim().length > 0 ? value.trim() : fallback;

/** Resolves a settings row (or a preview payload) into homepage copy. */
export function resolveHomepage(row: Partial<SiteSettingsRow> | null): HomepageContent {
  return {
    introHeading: trimmed(row?.intro_heading, HOMEPAGE_FALLBACKS.introHeading),
    introBody: trimmed(row?.intro_body, HOMEPAGE_FALLBACKS.introBody),
  };
}


export type SiteSettings = {
  row: SiteSettingsRow | null;
  siteName: string;
  /** Mark for light surfaces. Always resolves — falls back to the bundled logo. */
  logoUrl: string;
  /**
   * Mark for dark surfaces. Null when no dark variant has been uploaded, in
   * which case callers keep their existing invert treatment on `logoUrl`.
   */
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  homepage: HomepageContent;
};

export const FALLBACK_LOGO = fallbackLogo;

export function useSiteSettings() {
  const query = useQuery({
    queryKey: SITE_SETTINGS_KEY,
    staleTime: 60_000,
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select(SETTINGS_COLUMNS)
        .maybeSingle();
      if (error) throw error;
      const row = (data as SiteSettingsRow | null) ?? null;
      return {
        row,
        siteName: row?.site_name?.trim() || FIRM.name,
        logoUrl: row?.logo_path ? getBrandAssetUrl(row.logo_path) : fallbackLogo,
        logoDarkUrl: row?.logo_dark_path ? getBrandAssetUrl(row.logo_dark_path) : null,
        faviconUrl: row?.favicon_path ? getBrandAssetUrl(row.favicon_path) : null,
        homepage: resolveHomepage(row),
      };
    },
  });

  return {
    ...query,
    settings:
      query.data ?? {
        row: null,
        siteName: FIRM.name,
        logoUrl: fallbackLogo,
        logoDarkUrl: null,
        faviconUrl: null,
        homepage: resolveHomepage(null),
      },
  };
}

/**
 * Swaps the document favicon when one has been uploaded. Browsers do apply a
 * runtime <link rel="icon"> change; the static tags in index.html stay as the
 * default. (Social OG tags are deliberately not handled here — crawlers never
 * run this code.)
 */
export function useFaviconFromSettings() {
  const { settings } = useSiteSettings();
  const href = settings.faviconUrl;
  useEffect(() => {
    if (!href) return;
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
    );
    const previous = links.map((l) => l.href);
    links.forEach((l) => {
      l.href = href;
      l.type = "image/png";
    });
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.href = href;
      document.head.appendChild(link);
      return () => link.remove();
    }
    return () => {
      links.forEach((l, i) => {
        l.href = previous[i];
      });
    };
  }, [href]);
}
