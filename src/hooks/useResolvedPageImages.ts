import { useMemo } from "react";
import { FIRM } from "@/content/firm";
import { arrangeConceptPhotos, buildConceptPhotos, type ConceptPhoto } from "@/lib/conceptPhotos";
import { usePageContent, type PageName } from "@/hooks/usePageContent";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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

/** Order in which the homepage consumes the fallback pool. */
const HOME_ORDER = [
  "wall_1",
  "wall_2",
  "wall_3",
  "wall_4",
  "tile_projects",
  "tile_about",
  "tile_contact",
];

/** Projects the homepage leads with when the client has chosen nothing. */
const HOME_PRIORITY_SLUGS = [
  "262-bayshore-road",
  "11605-paradise-drive",
  "19-flamingo-road",
  "111-anchor-rd",
  "115-anchor-road",
];

const DEFAULT_ALT = `${FIRM.name} — residential architecture`;

/**
 * Resolves every editable photograph slot on the public site.
 *
 * Both the public page and its admin screen call this, so the panel and the
 * page can never disagree about which photograph is shown.
 */
export function useResolvedPageImages(heroOverride?: string | null) {
  const { data: projects = [], isLoading } = usePublicProjects();
  const { settings } = useSiteSettings();
  const page = usePageContent();

  const heroUrl = heroOverride !== undefined ? heroOverride : settings.homepage.heroImageUrl;

  const fallbacks = useMemo(() => {
    const map = new Map<string, ConceptPhoto>();

    const projectPhotos = arrangeConceptPhotos(
      buildConceptPhotos(projects, null, FIRM.name),
      HOME_PRIORITY_SLUGS,
    );
    const pool = heroUrl
      ? [{ url: heroUrl, alt: DEFAULT_ALT } as ConceptPhoto, ...projectPhotos]
      : projectPhotos;

    HOME_ORDER.forEach((slot, i) => {
      const photo = pool.length ? pool[i % pool.length] : undefined;
      if (photo) map.set(`home:${slot}`, photo);
    });

    const strip = projects.length >= 2 ? projects.slice(-2) : [];
    ["strip_1", "strip_2"].forEach((slot, i) => {
      const project = strip[i];
      if (project?.card_image_url) {
        map.set(`about:${slot}`, {
          url: project.card_image_url,
          alt: project.card_image_alt,
          title: project.title,
        });
      }
    });

    const contact = projects.find((p) => p.card_image_url);
    if (contact?.card_image_url) {
      map.set("contact:hero", {
        url: contact.card_image_url,
        alt: contact.card_image_alt,
        title: contact.title,
      });
    }

    return map;
  }, [projects, heroUrl]);

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
