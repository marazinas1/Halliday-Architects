import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GalleryImage = { src: string; alt: string; project: string };

export type GalleryBlock = {
  slug: string;
  name: string;
  link: string;
  images: GalleryImage[];
};

const publicUrl = (path: string) =>
  supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;

/**
 * Loads the combined portfolio gallery: every `gallery` image of every
 * published project, grouped by project and ordered by sort_order.
 */
export function usePublicGallery() {
  return useQuery({
    queryKey: ["public-gallery"],
    queryFn: async (): Promise<GalleryBlock[]> => {
      const { data: rows, error } = await supabase
        .from("projects")
        .select("id, slug, title, sort_order, created_at")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const projects = rows ?? [];
      if (!projects.length) return [];

      const { data: imgs, error: imgErr } = await supabase
        .from("project_images")
        .select("project_id, storage_path, alt_text, sort_order")
        .in(
          "project_id",
          projects.map((p) => p.id),
        )
        .eq("category", "gallery")
        .order("sort_order", { ascending: true });
      if (imgErr) throw imgErr;

      const byProject = new Map<string, GalleryImage[]>();
      for (const p of projects) byProject.set(p.id, []);
      for (const row of imgs ?? []) {
        const project = projects.find((p) => p.id === row.project_id);
        if (!project) continue;
        byProject.get(row.project_id)!.push({
          src: publicUrl(row.storage_path),
          alt: row.alt_text ?? project.title,
          project: project.title,
        });
      }

      return projects
        .map((p) => ({
          slug: p.slug,
          name: p.title,
          link: `/projects/${p.slug}`,
          images: byProject.get(p.id) ?? [],
        }))
        .filter((b) => b.images.length > 0);
    },
  });
}
