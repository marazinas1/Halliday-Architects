import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import portfolio1 from "@/assets/anchor-109-01.jpg";
import portfolio2 from "@/assets/28th-ext-view1.jpg";
import portfolio3 from "@/assets/asbury-ext-03.jpg";
import portfolio4 from "@/assets/bark-209-photo-ext-01.jpg";
import portfolio5 from "@/assets/anchor-111-01.jpg";
import portfolio6 from "@/assets/brighton-905-ext-01-card.jpg";

export type PortfolioItem = {
  title: string;
  image: string;
  description: string;
  /** Present when the project is managed in the admin panel. */
  slug?: string;
};

/** Curated placeholder projects, shown alongside the real ones. */
export const portfolio: PortfolioItem[] = [
  { title: "Bayfront Retreat", image: portfolio1, description: "A modern coastal retreat overlooking the bay." },
  { title: "Beachfront Custom", image: portfolio2, description: "A custom oceanfront residence built for everyday living." },
  { title: "Haven Hideaway", image: portfolio3, description: "A timeless family home in the heart of Ocean City." },
  { title: "Anchor Estate", image: portfolio5, description: "A multi-generational compound on a quiet Ocean City lane." },
  { title: "Drift Cottage", image: portfolio4, description: "A craftsman-detailed cottage with a generous covered porch." },
  { title: "Tide & Timber", image: portfolio6, description: "A duplex residence blending classic shingle style and modern interiors." },
];

const CardInner = ({ p }: { p: PortfolioItem }) => (
  <>
    <div className="overflow-hidden aspect-[4/3] mb-4" style={{ borderRadius: "4px" }}>
      <img
        src={p.image}
        alt={p.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
    </div>
    <h3 className="heading-card text-charcoal text-lg mb-2">{p.title}</h3>
    <p className="text-body text-sm">{p.description}</p>
  </>
);

export const PortfolioCard = ({ p }: { p: PortfolioItem }) =>
  p.slug ? (
    <Link to={`/projects/${p.slug}`} className="group block">
      <CardInner p={p} />
    </Link>
  ) : (
    <div className="group cursor-default">
      <CardInner p={p} />
    </div>
  );

/**
 * Combines the real projects managed in the admin panel with the curated
 * placeholder projects, so the grid always stays full.
 */
export function usePortfolioItems(limit?: number): PortfolioItem[] {
  const { data: projects = [] } = usePublicProjects();

  const real: PortfolioItem[] = projects
    .filter((p) => !!p.card_image_url)
    .map((p) => ({
      title: p.title,
      image: p.card_image_url as string,
      description: p.tagline ?? p.description ?? "",
      slug: p.slug,
    }));

  const realTitles = new Set(real.map((p) => p.title.toLowerCase()));
  const filler = portfolio.filter((p) => !realTitles.has(p.title.toLowerCase()));
  const items = [...real, ...filler];
  return limit ? items.slice(0, limit) : items;
}

export const PortfolioGrid = ({ limit }: { limit?: number }) => {
  const items = usePortfolioItems(limit);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
      {items.map((p) => (
        <Reveal key={p.title}>
          <PortfolioCard p={p} />
        </Reveal>
      ))}
    </div>
  );
};

export default PortfolioGrid;
