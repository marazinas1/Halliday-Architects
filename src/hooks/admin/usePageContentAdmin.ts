import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_CONTENT_KEY, type PageName } from "@/hooks/usePageContent";
import { deleteSiteImage, SITE_IMAGES_BUCKET } from "@/lib/admin/uploadSiteImage";

/**
 * Writes to the page content tables. Uploaded photographs are removed from
 * storage when they stop being used anywhere; photographs that belong to a
 * project are only ever referenced, never deleted.
 */

type SlotRef = { page: PageName; slot: string };

/** Removes an uploaded file once no slot and no service points at it. */
async function dropUnusedUpload(bucket: string | null, path: string | null) {
  if (bucket !== SITE_IMAGES_BUCKET || !path) return;
  const [media, services] = await Promise.all([
    supabase.from("page_media").select("id").eq("bucket", bucket).eq("path", path).limit(1),
    supabase.from("services").select("id").eq("image_bucket", bucket).eq("image_path", path).limit(1),
  ]);
  if ((media.data ?? []).length || (services.data ?? []).length) return;
  await deleteSiteImage(path);
}

async function readSlot({ page, slot }: SlotRef) {
  const { data } = await supabase
    .from("page_media")
    .select("bucket, path")
    .eq("page", page)
    .eq("slot", slot)
    .maybeSingle();
  return data ?? null;
}

export function useSetPageImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      page,
      slot,
      bucket,
      path,
      alt,
    }: SlotRef & { bucket: string; path: string; alt?: string | null }) => {
      const previous = await readSlot({ page, slot });
      const { error } = await supabase
        .from("page_media")
        .upsert({ page, slot, bucket, path, alt: alt ?? null }, { onConflict: "page,slot" });
      if (error) throw error;
      if (previous && !(previous.bucket === bucket && previous.path === path)) {
        await dropUnusedUpload(previous.bucket, previous.path);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY }),
  });
}

export function useClearPageImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ page, slot }: SlotRef) => {
      const previous = await readSlot({ page, slot });
      const { error } = await supabase
        .from("page_media")
        .delete()
        .eq("page", page)
        .eq("slot", slot);
      if (error) throw error;
      if (previous) await dropUnusedUpload(previous.bucket, previous.path);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY }),
  });
}

export function useSavePageText() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      page,
      values,
    }: {
      page: PageName;
      values: Record<string, string>;
    }) => {
      const rows = Object.entries(values).map(([slot, value]) => ({
        page,
        slot,
        value: value.trim(),
      }));
      if (!rows.length) return;
      const { error } = await supabase
        .from("page_text")
        .upsert(rows, { onConflict: "page,slot" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY }),
  });
}
