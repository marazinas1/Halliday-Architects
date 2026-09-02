import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_CONTENT_KEY, type PageName } from "@/hooks/usePageContent";
import { SITE_IMAGE_LIBRARY_KEY } from "@/hooks/admin/useSiteImageLibrary";
import {
  copyImageToDefaults,
  deleteSiteImage,
  DEFAULTS_PREFIX,
  SITE_IMAGES_BUCKET,
} from "@/lib/admin/uploadSiteImage";

/**
 * Writes to the page content tables. Uploaded photographs are kept in the
 * photograph library once uploaded — swapping a slot never deletes the file, so
 * it stays reusable; deletion happens in Website → Photographs.
 */

type SlotRef = { page: PageName; slot: string };

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
      const { error } = await supabase
        .from("page_media")
        .upsert({ page, slot, bucket, path, alt: alt ?? null }, { onConflict: "page,slot" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY });
      qc.invalidateQueries({ queryKey: SITE_IMAGE_LIBRARY_KEY });
    },
  });
}

export function useClearPageImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ page, slot }: SlotRef) => {
      const { error } = await supabase
        .from("page_media")
        .delete()
        .eq("page", page)
        .eq("slot", slot);
      if (error) throw error;
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

/**
 * Developer-only defaults. Setting one always copies the file into the
 * defaults area of `site-images`, so the default keeps working even if the
 * project the photograph came from is later deleted.
 */
export function useSetPageDefault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      page,
      slot,
      bucket,
      path,
      alt,
      previous,
    }: SlotRef & {
      bucket: string;
      path: string;
      alt?: string | null;
      previous?: { bucket: string; path: string } | null;
    }) => {
      const ownPath =
        bucket === SITE_IMAGES_BUCKET && path.startsWith(`${DEFAULTS_PREFIX}/`)
          ? path
          : await copyImageToDefaults(bucket, path, page, slot);

      const { error } = await supabase
        .from("page_media_defaults")
        .upsert(
          { page, slot, bucket: SITE_IMAGES_BUCKET, path: ownPath, alt: alt ?? null },
          { onConflict: "page,slot" },
        );
      if (error) throw error;

      if (
        previous &&
        previous.bucket === SITE_IMAGES_BUCKET &&
        previous.path.startsWith(`${DEFAULTS_PREFIX}/`) &&
        previous.path !== ownPath
      ) {
        await deleteSiteImage(previous.path);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY }),
  });
}

export function useClearPageDefault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      page,
      slot,
      previous,
    }: SlotRef & { previous?: { bucket: string; path: string } | null }) => {
      const { error } = await supabase
        .from("page_media_defaults")
        .delete()
        .eq("page", page)
        .eq("slot", slot);
      if (error) throw error;
      if (
        previous &&
        previous.bucket === SITE_IMAGES_BUCKET &&
        previous.path.startsWith(`${DEFAULTS_PREFIX}/`)
      ) {
        await deleteSiteImage(previous.path);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY }),
  });
}
