import { useMemo } from "react";
import { FIRM } from "@/content/firm";
import { usePageContent, type PageName } from "@/hooks/usePageContent";
import { usePublicProjects } from "@/hooks/usePublicProjects";

/**
 * A single photograph as the visitor sees it.
 *
 * `source` tells the admin panel whether the client chose this photograph or
 * whether the site is filling the slot with project photography, so the panel
 * can show exactly what is on the live page rather than an empty placeholder.
 */
export type ResolvedPhoto = {
  url: string | null;
  alt: string;
  source: "chosen" | "automatic" | "none";
  /** Project the automatic photograph came from. */
  from?: string;
};

/**
 * Order in which the homepage consumes published projects. One project per
 * slot, in the order the Projects list shows them — reorder there and the
 * homepage follows.
 */
const HOME_ORDER = [
  "wall_1",
  "wall_2",
  "wall_3",
  "wall_4",
  "wall_5",
  "wall_6",
  "tile_projects",
  "tile_about",
  "tile_contact",
];

const DEFAULT_ALT = `${FIRM.name} — residential architecture`;

type PoolPhoto = { url: string; alt: string; title?: string };

/**
 * Resolves every editable photograph slot on the public site.
 *
 * Both the public page and its admin screen call this, so the panel and the
 * page can never disagree about which photograph is shown.
 */
export function useResolvedPageImages() {
  const { data: projects = [], isLoading } = usePublicProjects();
  const page = usePageContent();

  const fallbacks = useMemo(() => {
    const map = new Map<string, PoolPhoto>();

    // Published projects in their display order — the same order the admin
    // Projects list shows and the client controls by reordering.
    const pool: PoolPhoto[] = projects
      .filter((p) => p.card_image_url)
      .map((p) => ({
        url: p.card_image_url as string,
        alt: p.card_image_alt,
        title: p.title,
      }));

    HOME_ORDER.forEach((slot, i) => {
      const photo = pool.length ? pool[i % pool.length] : undefined;
      if (photo) map.set(`home:${slot}`, photo);
    });

    const strip = pool.length >= 2 ? pool.slice(-2) : [];
    ["strip_1", "strip_2"].forEach((slot, i) => {
      const photo = strip[i];
      if (photo) map.set(`about:${slot}`, photo);
    });

    if (pool[0]) map.set("contact:hero", pool[0]);

    return map;
  }, [projects]);

  const resolve = (pageName: PageName, slot: string): ResolvedPhoto => {
    const chosen = page.image(pageName, slot);
    const chosenUrl = page.imageUrl(pageName, slot);
    if (chosenUrl) {
      return { url: chosenUrl, alt: chosen?.alt || DEFAULT_ALT, source: "chosen" };
    }
    const fallback = fallbacks.get(`${pageName}:${slot}`);
    if (fallback?.url) {
      return {
        url: fallback.url,
        alt: fallback.alt || DEFAULT_ALT,
        source: "automatic",
        from: fallback.title,
      };
    }
    return { url: null, alt: DEFAULT_ALT, source: "none" };
  };

  /**
   * Photograph a service band falls back to — one project per band, in the
   * order the bands appear.
   */
  const serviceFallback = (index: number): ResolvedPhoto => {
    const project = projects[index];
    if (project?.card_image_url) {
      return {
        url: project.card_image_url,
        alt: project.card_image_alt,
        source: "automatic",
        from: project.title,
      };
    }
    return { url: null, alt: DEFAULT_ALT, source: "none" };
  };

  return { resolve, serviceFallback, isLoading: isLoading || page.isLoading };
}
