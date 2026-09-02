import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/images/optimizeImage";

/** Portfolio image categories — these describe layout role, not the cover. */
export type ImageCategory = "hero" | "card" | "gallery";

export const IMAGE_CATEGORIES: ImageCategory[] = ["hero", "card", "gallery"];

export const IMAGE_CATEGORY_LABELS: Record<ImageCategory, string> = {
  hero: "Hero",
  card: "Card",
  gallery: "Gallery",
};

const BUCKET = "project-images";

/**
 * Optimises with the shared `project` preset (3000px WebP, EXIF stripped) and
 * uploads. `onProgress` reports 0-100 while the file is processed.
 */
export async function uploadImage(params: {
  file: File;
  category: ImageCategory;
  slug: string;
  onProgress?: (percent: number) => void;
}): Promise<{ storage_path: string; public_url: string }> {
  const blob = await optimizeImage(params.file, "project", params.onProgress);
  const path = `${params.slug}/${params.category}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { storage_path: path, public_url: data.publicUrl };
}

export function getPublicUrl(storage_path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(storage_path).data.publicUrl;
}

export async function deleteStorageObjects(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const chunks: string[][] = [];
  for (let i = 0; i < paths.length; i += 100) chunks.push(paths.slice(i, i + 100));
  for (const chunk of chunks) {
    const { data, error } = await supabase.storage.from(BUCKET).remove(chunk);
    if (error) throw error;
    // Storage returns `{ data: [], error: null }` when RLS filters rows or the
    // path doesn't exist — verify every requested path was actually removed.
    const removed = new Set((data ?? []).map((o: { name: string }) => o.name));
    const missing = chunk.filter((p) => !removed.has(p));
    if (missing.length) {
      const bySlug = new Map<string, string[]>();
      for (const p of missing) {
        const slug = p.split("/")[0];
        if (!slug) continue;
        const arr = bySlug.get(slug) ?? [];
        arr.push(p);
        bySlug.set(slug, arr);
      }
      const stillPresent: string[] = [];
      for (const [slug, slugPaths] of bySlug) {
        const { data: listData, error: listErr } = await supabase.rpc(
          "list_project_bucket_paths",
          { _slug: slug },
        );
        if (listErr) {
          throw new Error(
            `Storage delete verify failed for slug "${slug}": ${listErr.message}`,
          );
        }
        const present = new Set(
          ((listData as { name: string }[] | null) ?? []).map((r) => r.name),
        );
        for (const p of slugPaths) if (present.has(p)) stillPresent.push(p);
      }
      if (stillPresent.length) {
        throw new Error(
          `Storage delete failed for ${stillPresent.length} object(s): ${stillPresent.join(", ")}`,
        );
      }
    }
  }
}

/**
 * List every object stored under `<slug>/`. Admin-gated RPC — returns nothing
 * for non-admins, so never call it from public code paths.
 */
async function listAllUnder(slug: string): Promise<string[]> {
  const clean = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!clean) throw new Error("listAllUnder: empty slug");
  const { data, error } = await supabase.rpc("list_project_bucket_paths", {
    _slug: clean,
  });
  if (error) throw error;
  if (!data) throw new Error("list_project_bucket_paths returned no data");
  return (data as { name: string }[]).map((r) => r.name);
}

/**
 * Delete any storage object under `<slug>/` that project_images no longer
 * references. `referenced` MUST be non-empty — use wipeProjectFolder to clear
 * everything.
 */
export async function sweepProjectFolder(
  slug: string,
  referenced: Set<string>,
): Promise<{ removed: string[] }> {
  const prefix = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!prefix) throw new Error("sweepProjectFolder: empty slug");
  if (referenced.size === 0) {
    throw new Error(
      "sweepProjectFolder: referenced set is empty. Use wipeProjectFolder(slug) to delete everything under a slug.",
    );
  }
  const all = await listAllUnder(prefix);
  const allSet = new Set(all);
  const missing: string[] = [];
  for (const ref of referenced) if (!allSet.has(ref)) missing.push(ref);
  if (missing.length) {
    throw new Error(
      `sweepProjectFolder: listing missing ${missing.length} referenced path(s); aborting to avoid deleting live images. Missing: ${missing.join(", ")}`,
    );
  }
  const orphans = all.filter((p) => !referenced.has(p));
  if (orphans.length) await deleteStorageObjects(orphans);
  return { removed: orphans };
}

/** Remove every storage object under `<slug>/`. Only for project deletion. */
export async function wipeProjectFolder(slug: string): Promise<{ removed: string[] }> {
  const prefix = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!prefix) throw new Error("wipeProjectFolder: empty slug");
  const all = await listAllUnder(prefix);
  if (all.length) await deleteStorageObjects(all);
  return { removed: all };
}
