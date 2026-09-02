import imageCompression from "browser-image-compression";

/**
 * Shared client-side image pipeline. Every admin upload goes through this
 * before it reaches storage: resize down, convert to WebP, strip EXIF.
 */
export type ImagePreset =
  | "headshot"
  | "project"
  | "body"
  | "cover"
  | "logo"
  | "favicon"
  | "hero";

type PresetConfig = {
  /** Longest edge, in px. */
  maxDimension: number;
  /** Target file size after compression, in MB. */
  maxSizeMB: number;
  /** Files already under this size (bytes) skip re-encoding. */
  skipUnderBytes: number;
  quality: number;
  /** Output type. PNG keeps transparency, which logos and favicons need. */
  fileType: "image/webp" | "image/png";
};

export const IMAGE_PRESETS: Record<ImagePreset, PresetConfig> = {
  headshot: { maxDimension: 1200, maxSizeMB: 0.25, skipUnderBytes: 120_000, quality: 0.82, fileType: "image/webp" },
  // Architecture photography is the product here, so it is encoded generously;
  // delivery size is handled by responsive variants, not by shrinking the master.
  project: { maxDimension: 3000, maxSizeMB: 1.6, skipUnderBytes: 400_000, quality: 0.86, fileType: "image/webp" },
  // The homepage hero renders full-bleed on large displays, so it needs more
  // pixels than a gallery image inside a grid.
  hero: { maxDimension: 3200, maxSizeMB: 2.2, skipUnderBytes: 500_000, quality: 0.88, fileType: "image/webp" },
  // Images placed inside a post body render inside a narrow editorial column,
  // so they never need project-scale pixels. 1600px still allows an image to
  // break wider than the text without bloating a photo-heavy post.
  body: { maxDimension: 1600, maxSizeMB: 0.5, skipUnderBytes: 200_000, quality: 0.82, fileType: "image/webp" },
  cover: { maxDimension: 2000, maxSizeMB: 0.7, skipUnderBytes: 250_000, quality: 0.86, fileType: "image/webp" },

  // A logo is line art, not photography: keep transparency and barely compress.
  logo: { maxDimension: 800, maxSizeMB: 0.5, skipUnderBytes: 150_000, quality: 1, fileType: "image/png" },
  favicon: { maxDimension: 256, maxSizeMB: 0.1, skipUnderBytes: 30_000, quality: 1, fileType: "image/png" },
};

export class NotAnImageError extends Error {
  constructor() {
    super("That file is not an image. Please choose a JPG, PNG or WebP.");
    this.name = "NotAnImageError";
  }
}

async function readDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close?.();
  return dims;
}

/**
 * Returns a WebP blob sized for the given preset. Small, already-modest files
 * are returned untouched. `onProgress` reports 0-100 while processing.
 */
export async function optimizeImage(
  file: File,
  preset: ImagePreset,
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new NotAnImageError();
  }
  const cfg = IMAGE_PRESETS[preset];

  if (file.size <= cfg.skipUnderBytes && file.type === cfg.fileType) {
    const { width, height } = await readDimensions(file);
    if (Math.max(width, height) <= cfg.maxDimension) {
      onProgress?.(100);
      return file;
    }
  }

  const result = await imageCompression(file, {
    maxWidthOrHeight: cfg.maxDimension,
    maxSizeMB: cfg.maxSizeMB,
    initialQuality: cfg.quality,
    fileType: cfg.fileType,
    useWebWorker: true,
    preserveExif: false,
    onProgress: (p) => onProgress?.(p),
  });
  onProgress?.(100);
  return result;
}
