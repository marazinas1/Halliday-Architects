import { useState, type React } from "react";
import { cn } from "@/lib/utils";

/**
 * Photography delivered at the size the viewport actually needs.
 *
 * Storage URLs are rewritten to the image-transformation endpoint, so one
 * uploaded master serves every screen: a phone downloads ~600px, a large
 * display downloads the wide variant. Anything that is not a storage URL
 * (bundled assets, external images) is rendered untouched.
 */
const WIDTHS = [640, 960, 1400, 2000, 2400, 3000];

const OBJECT_MARKER = "/storage/v1/object/public/";
const RENDER_MARKER = "/storage/v1/render/image/public/";

/** Transformed URL at a given width, or null when the URL is not transformable. */
export function transformedUrl(url: string, width: number, quality = 80): string | null {
  if (!url.includes(OBJECT_MARKER)) return null;
  const base = url.replace(OBJECT_MARKER, RENDER_MARKER);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&resize=contain&quality=${quality}`;
}

/** Candidate widths for a slot, never larger than the slot can actually use. */
function widthsFor(maxWidth?: number) {
  if (!maxWidth) return WIDTHS;
  const kept = WIDTHS.filter((w) => w <= maxWidth);
  return kept.length ? kept : [WIDTHS[0]];
}

/** `srcset` string for a slot, or null when the URL is not transformable. */
export function buildSrcSet(url: string, quality = 80, maxWidth?: number): string | null {
  const variants = widthsFor(maxWidth)
    .map((w) => {
      const v = transformedUrl(url, w, quality);
      return v ? `${v} ${w}w` : null;
    })
    .filter(Boolean) as string[];
  return variants.length ? variants.join(", ") : null;
}

/** Tiny blurred stand-in shown while the real photograph downloads. */
export function placeholderUrlFor(url: string): string | null {
  return transformedUrl(url, 32, 30);
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** CSS `sizes`, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes?: string;
  /** True for the single largest above-the-fold image. */
  priority?: boolean;
  /**
   * Encoder quality for the transformed variants. Full-bleed heroes justify a
   * higher setting; images inside a grid do not, and the extra bytes would
   * only slow the page down.
   */
  quality?: number;
  /** Largest variant worth generating for this slot. */
  maxWidth?: number;
  /** Show a blurred low-resolution stand-in until the photograph decodes. */
  blurUp?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

export default function ResponsiveImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  quality = 80,
  maxWidth,
  blurUp = false,
  width,
  height,
  style,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const srcSet = buildSrcSet(src, quality, maxWidth);
  const transformable = srcSet !== null;
  const candidates = widthsFor(maxWidth);
  const fallbackWidth = priority
    ? candidates[Math.min(candidates.length - 1, 3)]
    : candidates[Math.min(candidates.length - 1, 2)];
  const placeholder = blurUp && transformable ? placeholderUrlFor(src) : null;

  const image = (
    <img
      src={transformable ? transformedUrl(src, fallbackWidth, quality)! : src}
      srcSet={srcSet ?? undefined}
      sizes={transformable ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      onLoad={() => setLoaded(true)}
      style={placeholder ? { ...style, opacity: loaded ? 1 : 0, transition: "opacity 400ms ease-out" } : style}
      className={cn(className)}
    />
  );

  if (!placeholder) return image;

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${placeholder})`,
          filter: "blur(18px)",
          transform: "scale(1.06)",
          opacity: loaded ? 0 : 1,
          transition: "opacity 400ms ease-out",
        }}
      />
      {image}
    </>
  );
}

