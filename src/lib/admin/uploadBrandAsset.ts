import { supabase } from "@/integrations/supabase/client";
import { optimizeImage, type ImagePreset } from "@/lib/images/optimizeImage";

const BUCKET = "brand-assets";

export type BrandAssetKind = "logo" | "logo_dark" | "favicon";

const PRESETS: Record<BrandAssetKind, ImagePreset> = {
  logo: "logo",
  logo_dark: "logo",
  favicon: "favicon",
};

/** Optimises a brand asset (PNG, transparency preserved) and uploads it. */
export async function uploadBrandAsset(
  file: File,
  kind: BrandAssetKind,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const blob = await optimizeImage(file, PRESETS[kind], onProgress);
  const path = `${kind}/${crypto.randomUUID()}.png`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: "image/png",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function getBrandAssetUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Removes a stored brand asset. Called on replace and on remove. */
export async function deleteBrandAsset(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
