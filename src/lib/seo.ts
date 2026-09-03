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
const SITE = (
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
