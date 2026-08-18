import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/images/optimizeImage";

const BUCKET = "team-photos";

/** Optimises to a headshot-sized WebP and uploads it. Returns the storage path. */
export async function uploadTeamPhoto(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const blob = await optimizeImage(file, "headshot", onProgress);
  const path = `members/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function getTeamPhotoUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Removes a stored headshot. Called on delete and on photo replacement. */
export async function deleteTeamPhoto(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
