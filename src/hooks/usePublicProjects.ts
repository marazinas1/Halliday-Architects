import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PublicProjectCard = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  location: string;
  sort_order: number;
  created_at: string;
  card_image_url: string | null;
};

const publicUrl = (path: string) =>
  supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;

const formatLocation = (row: {
  location_neighborhood: string | null;
  location_city: string | null;
  location_state: string | null;
}) =>
  [row.location_neighborhood, row.location_city, row.location_state]
    .filter((x): x is string => !!x && x.trim().length > 0)
    .join(", ");

/**
 * All published portfolio projects with a card image (card, falling back to
 * hero). Ordered by sort_order, then newest first.
 */
export function usePublicProjects() {
  return useQuery({
    queryKey: ["public-projects"],
    queryFn: async (): Promise<PublicProjectCard[]> => {
      const { data: rows, error } = await supabase
        .from("projects")
        .select(
          "id, slug, title, tagline, description, location_neighborhood, location_city, location_state, sort_order, created_at",
        )
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const projects = rows ?? [];
      if (!projects.length) return [];

      const { data: imgs, error: imgErr } = await supabase
        .from("project_images")
        .select("project_id, category, storage_path, sort_order")
        .in(
          "project_id",
          projects.map((p) => p.id),
        )
        .in("category", ["card", "hero"])
        .order("sort_order", { ascending: true });
      if (imgErr) throw imgErr;

      const byProject: Record<string, { card?: string; hero?: string }> = {};
      for (const row of imgs ?? []) {
        const bucket = (byProject[row.project_id] ??= {});
        if (row.category === "card" && !bucket.card) bucket.card = row.storage_path;
        if (row.category === "hero" && !bucket.hero) bucket.hero = row.storage_path;
      }

      const cards = projects.map((p) => {
        const paths = byProject[p.id];
        const path = paths?.card ?? paths?.hero ?? null;
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          location: formatLocation(p),
          sort_order: p.sort_order,
          created_at: p.created_at,
          card_image_url: path ? publicUrl(path) : null,
        };
      });

      cards.sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      });
      return cards;
    },
  });
}

/** Loads one published project (by slug) plus its hero and gallery images. */
export function usePublicProject(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-project", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (!project) return null;

      const { data: imgs, error: imgErr } = await supabase
        .from("project_images")
        .select("category, storage_path, alt_text, sort_order")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true });
      if (imgErr) throw imgErr;

      const images = imgs ?? [];
      return {
        project,
        location: formatLocation(project),
        heroUrl: (() => {
          const hero = images.find((i) => i.category === "hero") ?? images[0];
          return hero ? publicUrl(hero.storage_path) : null;
        })(),
        gallery: images
          .filter((i) => i.category === "gallery")
          .map((i) => ({ src: publicUrl(i.storage_path), alt: i.alt_text ?? project.title })),
      };
    },
  });
}
