import type React from "react";
import { cn } from "@/lib/utils";

/**
 * Photography delivered at the size the viewport actually needs.
 *
 * Storage URLs are rewritten to the image-transformation endpoint, so one
 * uploaded master serves every screen: a phone downloads ~600px, a large
 * display downloads the wide variant. Anything that is not a storage URL
 * (bundled assets, external images) is rendered untouched.
 */
const WIDTHS = [640, 960, 1400, 2000, 2800];

const OBJECT_MARKER = "/storage/v1/object/public/";
const RENDER_MARKER = "/storage/v1/render/image/public/";

/** Transformed URL at a given width, or null when the URL is not transformable. */
export function transformedUrl(url: string, width: number, quality = 80): string | null {
  if (!url.includes(OBJECT_MARKER)) return null;
  const base = url.replace(OBJECT_MARKER, RENDER_MARKER);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&resize=contain&quality=${quality}`;
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** CSS `sizes`, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes?: string;
  /** True for the single largest above-the-fold image. */
  priority?: boolean;
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
  width,
  height,
  style,
}: Props) {
  const variants = WIDTHS.map((w) => {
    const url = transformedUrl(src, w);
    return url ? `${url} ${w}w` : null;
  }).filter(Boolean) as string[];

  const transformable = variants.length > 0;

  return (
    <img
      src={transformable ? transformedUrl(src, 1400)! : src}
      srcSet={transformable ? variants.join(", ") : undefined}
      sizes={transformable ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      style={style}
      className={cn(className)}
    />
  );
}
