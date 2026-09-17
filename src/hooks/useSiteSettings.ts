import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBrandAssetUrl } from "@/lib/admin/uploadBrandAsset";
import { FIRM, SOCIAL_LINKS } from "@/content/firm";
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
  address_line1: string | null;
  address_line2: string | null;
  mailing_line1: string | null;
  mailing_line2: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  instagram_url: string | null;
  office_hours: string | null;
  maintenance_mode: boolean;
  maintenance_message: string | null;
};

const SETTINGS_COLUMNS =
  "id, site_name, logo_path, logo_dark_path, favicon_path, intro_heading, intro_body, inquiry_notify_emails, address_line1, address_line2, mailing_line1, mailing_line2, phone, fax, email, instagram_url, office_hours, maintenance_mode, maintenance_message";

export type HomepageContent = {
  introHeading: string;
  introBody: string;
};

/** Business contacts. Editable in the admin; firm constants are the fallback. */
export type ContactDetails = {
  addressLine1: string;
  addressLine2: string;
  mailingLine1: string;
  mailingLine2: string;
  phone: string;
  phoneHref: string;
  fax: string;
  email: string;
  instagramUrl: string;
  officeHours: string;
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

export const MAINTENANCE_FALLBACK_MESSAGE =
  "Our website is briefly offline for updates. Please check back shortly.";

/** Holding-page state. Only visitors see it; signed-in staff never do. */
export function resolveMaintenance(
  row: Partial<SiteSettingsRow> | null,
): { enabled: boolean; message: string } {
  return {
    enabled: Boolean(row?.maintenance_mode),
    message: trimmed(row?.maintenance_message, MAINTENANCE_FALLBACK_MESSAGE),
  };
}

export function resolveContact(row: Partial<SiteSettingsRow> | null): ContactDetails {
  const phone = trimmed(row?.phone, FIRM.phone);
  return {
    addressLine1: trimmed(row?.address_line1, FIRM.address1),
    addressLine2: trimmed(row?.address_line2, FIRM.address2),
    mailingLine1: trimmed(row?.mailing_line1, FIRM.mailing1),
    mailingLine2: trimmed(row?.mailing_line2, FIRM.mailing2),
    phone,
    phoneHref: `tel:${phone.replace(/[^0-9+]/g, "")}`,
    fax: trimmed(row?.fax, FIRM.fax),
    email: trimmed(row?.email, FIRM.email),
    instagramUrl: trimmed(row?.instagram_url, SOCIAL_LINKS[0].url),
    officeHours: trimmed(row?.office_hours, "Monday – Friday"),
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
  contact: ContactDetails;
  maintenance: { enabled: boolean; message: string };
};

export const FALLBACK_LOGO = fallbackLogo;

/** Standalone fetcher so route loaders can prime this query on the server. */
export async function fetchSiteSettings(): Promise<SiteSettings> {
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
    contact: resolveContact(row),
    maintenance: resolveMaintenance(row),
  };
}

export function useSiteSettings() {
  const query = useQuery({
    queryKey: SITE_SETTINGS_KEY,
    staleTime: 60_000,
    queryFn: fetchSiteSettings,
  });


  const data = query.data;

  return {
    ...query,
    settings: {
      row: data?.row ?? null,
      siteName: data?.siteName ?? FIRM.name,
      logoUrl: data?.logoUrl ?? fallbackLogo,
      logoDarkUrl: data?.logoDarkUrl ?? null,
      faviconUrl: data?.faviconUrl ?? null,
      // Cached payloads from an older build can lack these, so they are
      // always re-derived rather than trusted blindly.
      homepage: data?.homepage ?? resolveHomepage(data?.row ?? null),
      contact: data?.contact ?? resolveContact(data?.row ?? null),
      maintenance: data?.maintenance ?? resolveMaintenance(data?.row ?? null),
    } satisfies SiteSettings,
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
        l.href = previous[i] ?? l.href;
      });
    };
  }, [href]);
}
