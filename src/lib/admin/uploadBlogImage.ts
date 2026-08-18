import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/images/optimizeImage";

export const BLOG_BUCKET = "blog-images";

/** Uploads a post cover (full-bleed, so a larger preset). Returns the storage path. */
export async function uploadBlogCover(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return upload(file, "cover", "covers", onProgress);
}

/** Uploads an image placed inside a post body (narrow column, 1600px preset). */
export async function uploadBlogBodyImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return upload(file, "body", "body", onProgress);
}

async function upload(
  file: File,
  preset: "cover" | "body",
  prefix: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const blob = await optimizeImage(file, preset, onProgress);
  const path = `${prefix}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(BLOG_BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function getBlogImageUrl(path: string): string {
  return supabase.storage.from(BLOG_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deleteBlogImages(paths: string[]): Promise<void> {
  const clean = paths.filter(Boolean);
  if (clean.length === 0) return;
  const { error } = await supabase.storage.from(BLOG_BUCKET).remove(clean);
  if (error) throw error;
}

/**
 * Extracts `blog-images` storage paths referenced by post body HTML. Used both
 * to clean up on delete and to prune images dropped from a post before saving.
 */
export function extractBodyImagePaths(html: string | null | undefined): string[] {
  if (!html) return [];
  const found = new Set<string>();
  const re = /\/storage\/v1\/object\/public\/blog-images\/([^"'\s?)]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    found.add(decodeURIComponent(m[1]));
  }
  return [...found];
}
