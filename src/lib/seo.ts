/**
 * Server-rendered head metadata.
 *
 * Every public route builds its title/description/social tags with this helper
 * inside its `head()`, so the tags are present in the HTML the crawler reads —
 * not applied later in the browser.
 */

/**
 * The site's own address. Setting VITE_SITE_URL is the single step needed when
 * the site moves to its own domain — nothing else here hard-codes a host.
 */
export const SITE = (
  (import.meta.env["VITE_SITE_URL"] as string | undefined) || "https://ha.stagehomy.com"
).replace(/\/+$/, "");

const DEFAULT_OG_IMAGE = "/og-image.jpg";

export interface PageHeadInput {
  title: string;
  description: string;
  /** Path of this page, e.g. "/about". Used for canonical and og:url. */
  path: string;
  image?: string | null | undefined;
  type?: "website" | "article";
  /** Error/empty states that should never be indexed. */
  noindex?: boolean;
}

export function pageHead({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
}: PageHeadInput) {
  const url = `${SITE}${path}`;
  const raw = image || DEFAULT_OG_IMAGE;
  const imageUrl = raw.startsWith("http") ? raw : `${SITE}${raw}`;

  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:image", content: imageUrl },
    { property: "og:image:alt", content: title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  if (noindex) meta.push({ name: "robots", content: "noindex, follow" });

  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}

/**
 * Firm JSON-LD (Organization + ArchitecturalService). Contact fields come
 * from the admin-editable site settings; the address lines are parsed back
 * into schema fields, falling back to the firm constants.
 */
export interface FirmJsonLdInput {
  siteName: string;
  phone: string;
  fax: string;
  email: string;
  instagramUrl: string;
  addressLine1: string;
  addressLine2: string;
}

export function firmJsonLd(firm: FirmJsonLdInput): string {
  const match = firm.addressLine2.match(/^(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  const address = {
    "@type": "PostalAddress",
    streetAddress: firm.addressLine1,
    addressLocality: match?.[1] ?? "Ocean City",
    addressRegion: match?.[2] ?? "NJ",
    postalCode: match?.[3] ?? "08226",
    addressCountry: "US",
  };
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: firm.siteName,
        url: SITE,
        email: firm.email,
        sameAs: firm.instagramUrl ? [firm.instagramUrl] : [],
      },
      {
        "@type": "ArchitecturalService",
        "@id": `${SITE}/#practice`,
        name: firm.siteName,
        url: SITE,
        telephone: firm.phone.replace(/[^0-9+]/g, ""),
        faxNumber: firm.fax.replace(/[^0-9+]/g, ""),
        email: firm.email,
        address,
        parentOrganization: { "@id": `${SITE}/#organization` },
      },
    ],
  });
}

/** Article JSON-LD for a published journal entry. */
export interface ArticleJsonLdInput {
  title: string;
  description: string;
  slug: string;
  coverUrl: string | null;
  publishedAt: string | null;
  siteName: string;
}

export function articleJsonLd(post: ArticleJsonLdInput): string {
  const url = `${SITE}/blog/${post.slug}`;
  const image = post.coverUrl?.startsWith("http") ? post.coverUrl : `${SITE}${post.coverUrl ?? ""}`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: url,
    ...(post.coverUrl ? { image: [image] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    author: { "@id": `${SITE}/#organization` },
    publisher: { "@id": `${SITE}/#organization` },
  });
}
