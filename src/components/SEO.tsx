import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string | undefined;
  type?: "website" | "article" | undefined;
  /** Error/empty states that should never be indexed. */
  noindex?: boolean | undefined;
}

/**
 * The site's own address. Setting VITE_SITE_URL is the single step needed when
 * the site moves to its own domain — nothing else here hard-codes a host.
 * Falls back to the browser origin, then to relative URLs.
 */
const SITE = (
  import.meta.env["VITE_SITE_URL"] ||
  (typeof window !== "undefined" ? window.location.origin : "") ||
  ""
).replace(/\/+$/, "");

const DEFAULT_OG_IMAGE = "/og-image.jpg";

const SEO = ({ title, description, path, image, type = "website", noindex = false }: SEOProps) => {
  const url = `${SITE}${path}`;
  const raw = image || DEFAULT_OG_IMAGE;
  const imageUrl = raw.startsWith("http") ? raw : `${SITE}${raw}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEO;
