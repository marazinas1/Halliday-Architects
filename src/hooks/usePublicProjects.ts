import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PROJECT_TYPES = ["new_build", "renovation", "interior", "addition"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  new_build: "New build",
  renovation: "Renovation",
  interior: "Interior",
  addition: "Addition",
};

export type PublicProjectCard = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  location: string;
  project_type: string;
  year_completed: number | null;
  sort_order: number;
  created_at: string;
  card_image_url: string | null;
  /** Resolved description for the card image (written alt_text or generated). */
  card_image_alt: string;
  /** Every tag slug attached to the project or to any of its images. */
  tag_slugs: string[];
};

const publicUrl = (path: string) =>
  supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl;

const GENERIC_CATEGORIES = new Set(["hero", "card", "gallery"]);

/** "Kitchens" -> "Kitchen". Only handles the simple English plurals we use. */
const singularise = (word: string) => {
  if (/ies$/i.test(word)) return word.replace(/ies$/i, "y");
  if (/(ches|shes|sses|xes)$/i.test(word)) return word.replace(/es$/i, "");
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.replace(/s$/i, "");
  return word;
};

const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/**
 * A description built only from facts already in the database: the image's
 * category, the project title and its location. Never invents anything about
 * what the photograph shows. Used when no alt_text has been written.
 */
export const describeImage = (
  category: string | null,
  title: string,
  location: string | null,
): string => {
  const place = location?.trim() ? `, ${location.trim()}` : "";
  const cat = category?.trim();
  if (!cat || GENERIC_CATEGORIES.has(cat.toLowerCase())) {
    return capitalise(`${title}${place}`.replace(/\s+/g, " ").trim());
  }
  const label = singularise(cat.replace(/[_-]+/g, " ").trim());
  return capitalise(`${label} at ${title}${place}`.replace(/\s+/g, " ").trim());
};

const formatLocation = (row: {
  location_city: string | null;
  location_state: string | null;
}) =>
  [row.location_city, row.location_state]
    .filter((x): x is string => !!x && x.trim().length > 0)
    .join(", ");

/**
 * All published portfolio projects with a card image (explicit cover first,
 * then a card image, then the hero). Ordered by sort_order, newest first.
 */
export async function fetchPublicProjects(): Promise<PublicProjectCard[]> {
    {
      const { data: rows, error } = await supabase
        .from("projects")
        .select(
          "id, slug, title, tagline, description, location_city, location_state, project_type, year_completed, sort_order, created_at",
        )
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const projects = rows ?? [];
      if (!projects.length) return [];
      const ids = projects.map((p) => p.id);

      const [{ data: imgs, error: imgErr }, { data: pTags }, { data: iTags }] =
        await Promise.all([
          supabase
            .from("project_images")
            // Only cover candidates — gallery photography is fetched by the
            // project page itself, so this payload stays flat as the archive grows.
            .select("id, project_id, category, storage_path, alt_text, sort_order, is_cover")
            .in("project_id", ids)
            .or("is_cover.eq.true,category.in.(card,hero)")
            .order("sort_order", { ascending: true }),
          supabase.from("project_tags").select("project_id, tags(slug)").in("project_id", ids),
          // Image tags come back already joined to their project, so the whole
          // image table never has to travel to the browser.
          supabase
            .from("image_tags")
            .select("tags(slug), project_images!inner(project_id)")
            .in("project_images.project_id", ids),

        ]);
      if (imgErr) throw imgErr;

      const images = imgs ?? [];

      const tagsByProject = new Map<string, Set<string>>();
      const addTag = (projectId: string | undefined, slug: string | undefined) => {
        if (!projectId || !slug) return;
        const set = tagsByProject.get(projectId) ?? new Set<string>();
        set.add(slug);
        tagsByProject.set(projectId, set);
      };
      for (const row of pTags ?? []) {
        addTag(row.project_id, (row.tags as { slug: string } | null)?.slug);
      }
      for (const row of iTags ?? []) {
        addTag(
          (row.project_images as { project_id: string } | null)?.project_id,
          (row.tags as { slug: string } | null)?.slug,
        );

      }

      const pick = (projectId: string) => {
        const own = images.filter((i) => i.project_id === projectId);
        const chosen =
          own.find((i) => i.is_cover) ??
          own.find((i) => i.category === "card") ??
          own.find((i) => i.category === "hero") ??
          own[0];
        return chosen ?? null;
      };

      const cards = projects.map((p) => {
        const cover = pick(p.id);
        const loc = formatLocation(p);
        return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        location: loc,
        project_type: p.project_type,
        year_completed: p.year_completed,
        sort_order: p.sort_order,
        created_at: p.created_at,
        card_image_url: cover ? publicUrl(cover.storage_path) : null,
        card_image_alt: cover
          ? cover.alt_text?.trim() || describeImage(cover.category, p.title, loc)
          : p.title,
        tag_slugs: [...(tagsByProject.get(p.id) ?? [])],
        };
      });

      cards.sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      });
      return cards;
    }
}

/**
 * All published portfolio projects with a card image.
 *
 * Home, Projects, About and Services all read this list through
 * `useResolvedPageImages`; keep it warm so moving between them does not
 * refetch the catalogue, and never remove a field the card image depends on.
 */
export function usePublicProjects() {
  return useQuery({
    queryKey: ["public-projects"],
    staleTime: 5 * 60_000,
    queryFn: fetchPublicProjects,
  });
}

export type GalleryItem = { id: string; src: string; alt: string };

export type ProjectOrderItem = {
  slug: string;
  title: string;
  card_image_url: string | null;
  card_image_alt: string;
};

/** Loads one published project (by slug) plus its hero and gallery images. */
export function usePublicProject(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-project", slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (!project) return null;

      const { data: imgs, error: imgErr } = await supabase
        .from("project_images")
        .select("id, category, storage_path, alt_text, sort_order, is_cover")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true });
      if (imgErr) throw imgErr;

      const images = imgs ?? [];
      const hero = images.find((i) => i.category === "hero") ?? images.find((i) => i.is_cover) ?? images[0];

      const location = formatLocation(project);
      const resolveAlt = (i: { alt_text: string | null; category: string | null }) =>
        i.alt_text?.trim() || describeImage(i.category, project.title, location);

      return {
        project,
        location,
        heroUrl: hero ? publicUrl(hero.storage_path) : null,
        heroAlt: hero ? resolveAlt(hero) : project.title,
        gallery: images
          .filter((i) => i.id !== hero?.id && i.category !== "card")
          .map(
            (i): GalleryItem => ({
              id: i.id,
              src: publicUrl(i.storage_path),
              alt: resolveAlt(i),
            }),
          ),
      };
    },
  });
}

/** Published projects in display order — used for "next project" navigation. */
export function useProjectOrder() {
  return useQuery({
    queryKey: ["public-project-order"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, slug, title, location_city, location_state, sort_order, created_at")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const projects = data ?? [];
      if (!projects.length) return [];

      const { data: images, error: imageError } = await supabase
        .from("project_images")
        .select("project_id, category, storage_path, alt_text, sort_order, is_cover")
        .in("project_id", projects.map((project) => project.id))
        .order("sort_order", { ascending: true });
      if (imageError) throw imageError;

      return projects.map((project): ProjectOrderItem => {
        const own = (images ?? []).filter((image) => image.project_id === project.id);
        const cover =
          own.find((image) => image.is_cover) ??
          own.find((image) => image.category === "card") ??
          own.find((image) => image.category === "hero") ??
          own[0];
        const location = formatLocation(project);
        return {
          slug: project.slug,
          title: project.title,
          card_image_url: cover ? publicUrl(cover.storage_path) : null,
          card_image_alt: cover
            ? cover.alt_text?.trim() || describeImage(cover.category, project.title, location)
            : project.title,
        };
      });
    },
  });
}
