import imageCompression from "browser-image-compression";

/**
 * Shared client-side image pipeline. Every admin upload goes through this
 * before it reaches storage: resize down, convert to WebP, strip EXIF.
 */
export type ImagePreset = "headshot" | "project" | "cover";

type PresetConfig = {
  /** Longest edge, in px. */
  maxDimension: number;
  /** Target file size after compression, in MB. */
  maxSizeMB: number;
  /** Files already under this size (bytes) skip re-encoding. */
  skipUnderBytes: number;
  quality: number;
};

export const IMAGE_PRESETS: Record<ImagePreset, PresetConfig> = {
  headshot: { maxDimension: 1200, maxSizeMB: 0.25, skipUnderBytes: 120_000, quality: 0.82 },
  project: { maxDimension: 2400, maxSizeMB: 1, skipUnderBytes: 400_000, quality: 0.82 },
  cover: { maxDimension: 1800, maxSizeMB: 0.6, skipUnderBytes: 250_000, quality: 0.82 },
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

  if (file.size <= cfg.skipUnderBytes && file.type === "image/webp") {
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
    fileType: "image/webp",
    useWebWorker: true,
    preserveExif: false,
    onProgress: (p) => onProgress?.(p),
  });
  onProgress?.(100);
  return result;
}
