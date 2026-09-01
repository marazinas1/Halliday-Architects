import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES_KEY, type PublicService } from "@/hooks/useServices";
import { deleteSiteImage, SITE_IMAGES_BUCKET } from "@/lib/admin/uploadSiteImage";

export type ServiceDraft = {
  id?: string;
  title: string;
  body: string;
  includes: string[];
  image_bucket: string | null;
  image_path: string | null;
  sort_order: number;
  published: boolean;
};

/** Uploaded band photographs are removed once nothing points at them. */
async function dropUnusedUpload(bucket: string | null, path: string | null) {
  if (bucket !== SITE_IMAGES_BUCKET || !path) return;
  const [media, services] = await Promise.all([
    supabase.from("page_media").select("id").eq("bucket", bucket).eq("path", path).limit(1),
    supabase.from("services").select("id").eq("image_bucket", bucket).eq("image_path", path).limit(1),
  ]);
  if ((media.data ?? []).length || (services.data ?? []).length) return;
  await deleteSiteImage(path);
}

export function useSaveService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draft: ServiceDraft) => {
      let previous: { image_bucket: string | null; image_path: string | null } | null = null;
      if (draft.id) {
        const { data } = await supabase
          .from("services")
          .select("image_bucket, image_path")
          .eq("id", draft.id)
          .maybeSingle();
        previous = data ?? null;
      }

      const payload = {
        title: draft.title.trim(),
        body: draft.body.trim(),
        includes: draft.includes.map((i) => i.trim()).filter(Boolean),
        image_bucket: draft.image_bucket,
        image_path: draft.image_path,
        sort_order: draft.sort_order,
        published: draft.published,
      };

      if (draft.id) {
        const { error } = await supabase.from("services").update(payload).eq("id", draft.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      }

      if (
        previous &&
        !(previous.image_bucket === draft.image_bucket && previous.image_path === draft.image_path)
      ) {
        await dropUnusedUpload(previous.image_bucket, previous.image_path);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (service: PublicService) => {
      const { error } = await supabase.from("services").delete().eq("id", service.id);
      if (error) throw error;
      await dropUnusedUpload(service.image_bucket, service.image_path);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

/** Persists a whole reordered list in one pass. */
export function useReorderServices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ordered: PublicService[]) => {
      await Promise.all(
        ordered.map((service, index) =>
          supabase.from("services").update({ sort_order: index + 1 }).eq("id", service.id),
        ),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}
