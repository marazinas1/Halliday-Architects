import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { deleteSiteImage, SITE_IMAGES_BUCKET } from "@/lib/admin/uploadSiteImage";

export const SITE_IMAGE_LIBRARY_KEY = ["site-image-library"];

/** Folders standalone photographs are uploaded into. */
const FOLDERS = ["homepage"];

export type SiteImage = {
  path: string;
  url: string;
  createdAt: string | null;
  sizeBytes: number | null;
  /** Human-readable places this photograph is used. Empty means unused. */
  usedBy: string[];
};

const PAGE_LABEL: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  contact: "Contact",
};

const prettySlot = (slot: string) => slot.replace(/_/g, " ");

/**
 * Every photograph uploaded through a picker (the `site-images` bucket), with
 * the slots and services that reference it. Used by the photograph library
 * screen and by the picker's "Uploaded" tab.
 */
export function useSiteImageLibrary() {
  return useQuery({
    queryKey: SITE_IMAGE_LIBRARY_KEY,
    queryFn: async (): Promise<SiteImage[]> => {
      const listings = await Promise.all(
        FOLDERS.map(async (folder) => {
          const { data, error } = await supabase.storage
            .from(SITE_IMAGES_BUCKET)
            .list(folder, { limit: 500, sortBy: { column: "created_at", order: "desc" } });
          if (error) throw error;
          return (data ?? [])
            .filter((f) => f.id)
            .map((f) => ({
              path: `${folder}/${f.name}`,
              createdAt: (f.created_at as string | undefined) ?? null,
              sizeBytes: (f.metadata as { size?: number } | null)?.size ?? null,
            }));
        }),
      );
      const files = listings.flat();

      const [media, services] = await Promise.all([
        supabase
          .from("page_media")
          .select("page, slot, path")
          .eq("bucket", SITE_IMAGES_BUCKET),
        supabase
          .from("services")
          .select("title, image_path")
          .eq("image_bucket", SITE_IMAGES_BUCKET),
      ]);

      const usage = new Map<string, string[]>();
      (media.data ?? []).forEach((row) => {
        const list = usage.get(row.path) ?? [];
        list.push(`${PAGE_LABEL[row.page] ?? row.page} — ${prettySlot(row.slot)}`);
        usage.set(row.path, list);
      });
      (services.data ?? []).forEach((row) => {
        if (!row.image_path) return;
        const list = usage.get(row.image_path) ?? [];
        list.push(`Services — ${row.title}`);
        usage.set(row.image_path, list);
      });

      return files.map((f) => ({
        ...f,
        url: supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(f.path).data.publicUrl,
        usedBy: usage.get(f.path) ?? [],
      }));
    },
  });
}

/** Deletes an uploaded photograph. Refuses when something still uses it. */
export function useDeleteSiteImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (image: SiteImage) => {
      if (image.usedBy.length) {
        throw new Error("This photograph is still in use. Replace it there first.");
      }
      await deleteSiteImage(image.path);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SITE_IMAGE_LIBRARY_KEY }),
  });
}
