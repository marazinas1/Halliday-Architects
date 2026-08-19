import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPublicUrl } from "@/lib/admin/imageUpload";

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  sort_order: number;
  updated_at: string;
  project_type: string;
  featured: boolean;
  location_city: string | null;
  year_completed: number | null;
  card_image_url: string | null;
};

export function useProjects() {
  return useQuery({
    queryKey: ["admin-projects"],
    queryFn: async (): Promise<ProjectListItem[]> => {
      const { data: rows, error } = await supabase
        .from("projects")
        .select(
          "id, slug, title, published, sort_order, updated_at, project_type, featured, location_city, year_completed",
        )
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const projects = rows ?? [];
      const ids = projects.map((p) => p.id);
      const imagesByProject = new Map<string, string>();
      if (ids.length) {
        const { data: imgs } = await supabase
          .from("project_images")
          .select("project_id, storage_path, sort_order, category")
          .in("category", ["card", "hero"])
          .in("project_id", ids)
          .order("sort_order", { ascending: true });
        for (const img of imgs ?? []) {
          if (!imagesByProject.has(img.project_id)) {
            imagesByProject.set(img.project_id, getPublicUrl(img.storage_path));
          }
        }
      }
      return projects.map((p) => ({
        ...p,
        card_image_url: imagesByProject.get(p.id) ?? null,
      }));
    },
  });
}
