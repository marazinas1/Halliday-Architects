import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/images/optimizeImage";

/**
 * Site-level photography that is not attached to a project (currently the
 * homepage hero). Kept out of `brand-assets`, which holds small permanent
 * brand marks with a very different lifecycle.
 */
export const SITE_IMAGES_BUCKET = "site-images";

/** Optimises with the `hero` preset (2560px WebP) and uploads. */
export async function uploadSiteImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const blob = await optimizeImage(file, "hero", onProgress);
  const path = `homepage/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/**
 * Removes an uploaded site image. Callers MUST only pass paths whose bucket is
 * `site-images` — a hero that references project photography is not ours to
 * delete.
 */
export async function deleteSiteImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).remove([path]);
  if (error) throw error;
}

/** Where developer-set default photographs live, independent of any project. */
export const DEFAULTS_PREFIX = "defaults";

/**
 * Copies any public photograph into the defaults area of `site-images`, so the
 * default survives deletion of the project the photograph came from.
 */
export async function copyImageToDefaults(
  sourceBucket: string,
  sourcePath: string,
  page: string,
  slot: string,
): Promise<string> {
  const publicUrl = supabase.storage.from(sourceBucket).getPublicUrl(sourcePath).data.publicUrl;
  const response = await fetch(publicUrl);
  if (!response.ok) throw new Error("Could not read the source photograph.");
  const blob = await response.blob();
  const extension = sourcePath.split(".").pop()?.toLowerCase() || "webp";
  const path = `${DEFAULTS_PREFIX}/${page}/${slot}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: blob.type || "image/webp",
    upsert: false,
  });
  if (error) throw error;
  return path;
}
