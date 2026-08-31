import type { PublicProjectCard } from "@/hooks/usePublicProjects";

/**
 * A photograph slot used by the alternative homepage concepts (/home-v2 and
 * /home-v3). Purely presentational: it carries the image, its description and
 * the caption facts we already store for the project behind it.
 */
export type ConceptPhoto = {
  url: string | null;
  alt: string;
  title?: string;
  location?: string;
  href?: string;
};

/**
 * Builds an ordered pool of photographs for the concept homepages.
 *
 * The homepage hero (set in /admin/homepage) leads when one exists, followed by
 * one cover photograph per published project in display order — so no project
 * repeats before every project has appeared. Slots left without a photograph
 * fall back to the concept's neutral panel.
 */
export const buildConceptPhotos = (
  projects: PublicProjectCard[],
  heroUrl: string | null | undefined,
  firmName: string,
): ConceptPhoto[] => {
  const fromProjects: ConceptPhoto[] = projects
    .filter((p) => p.card_image_url)
    .map((p) => ({
      url: p.card_image_url,
      alt: p.card_image_alt,
      title: p.title,
      location: p.location,
      href: `/projects/${p.slug}`,
    }));

  if (!heroUrl) return fromProjects;
  return [
    { url: heroUrl, alt: `${firmName} — residential architecture` },
    ...fromProjects,
  ];
};

/** Picks photographs at the given indices, wrapping around a short pool. */
export const pickPhotos = (pool: ConceptPhoto[], indices: number[]): (ConceptPhoto | undefined)[] =>
  indices.map((i) => (pool.length ? pool[i % pool.length] : undefined));
