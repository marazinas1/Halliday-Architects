import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPublicUrl } from "@/lib/admin/imageUpload";

export type LibraryImage = {
  id: string;
  storage_path: string;
  url: string;
  alt: string;
  category: string;
};

export type LibraryProject = {
  id: string;
  title: string;
  images: LibraryImage[];
};

/**
 * Every image belonging to a published project, grouped by project. Used by the
 * hero picker so the client can reuse photography that is already in the system
 * instead of uploading the same file twice.
 */
export function useProjectImageLibrary() {
  return useQuery({
    queryKey: ["admin-project-image-library"],
    queryFn: async (): Promise<LibraryProject[]> => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const rows = projects ?? [];
      if (!rows.length) return [];

      const { data: imgs, error: imgErr } = await supabase
        .from("project_images")
        .select("id, project_id, storage_path, alt_text, sort_order, category")
        .in(
          "project_id",
          rows.map((p) => p.id),
        )
        .order("sort_order", { ascending: true });
      if (imgErr) throw imgErr;

      return rows
        .map((p) => ({
          id: p.id,
          title: p.title,
          images: (imgs ?? [])
            .filter((i) => i.project_id === p.id)
            .map((i) => ({
              id: i.id,
              storage_path: i.storage_path,
              url: getPublicUrl(i.storage_path),
              alt: i.alt_text ?? p.title,
              category: i.category,
            })),
        }))
        .filter((p) => p.images.length > 0);
    },
  });
}
