import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBrandAssetUrl } from "@/lib/admin/uploadBrandAsset";
import { FIRM } from "@/content/firm";
import fallbackLogo from "@/assets/halliday-logo.png";

export const SITE_SETTINGS_KEY = ["site-settings"];

export type SiteSettingsRow = {
  id: string;
  site_name: string;
  logo_path: string | null;
  logo_dark_path: string | null;
  favicon_path: string | null;
};

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
};

export const FALLBACK_LOGO = fallbackLogo;

export function useSiteSettings() {
  const query = useQuery({
    queryKey: SITE_SETTINGS_KEY,
    staleTime: 60_000,
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id, site_name, logo_path, logo_dark_path, favicon_path")
        .maybeSingle();
      if (error) throw error;
      const row = (data as SiteSettingsRow | null) ?? null;
      return {
        row,
        siteName: row?.site_name?.trim() || FIRM.name,
        logoUrl: row?.logo_path ? getBrandAssetUrl(row.logo_path) : fallbackLogo,
        logoDarkUrl: row?.logo_dark_path ? getBrandAssetUrl(row.logo_dark_path) : null,
        faviconUrl: row?.favicon_path ? getBrandAssetUrl(row.favicon_path) : null,
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
