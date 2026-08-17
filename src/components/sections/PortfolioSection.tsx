import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { usePublicProjects } from "@/hooks/usePublicProjects";

/** Neutral placeholder until the client's photography arrives. */
const PLACEHOLDER = "/placeholder.svg";

export type PortfolioItem = {
  title: string;
  image: string;
  description: string;
  /** Present when the project is managed in the admin panel. */
  slug?: string;
};

/** Placeholder projects shown until the client's projects are added in the admin panel. */
export const portfolio: PortfolioItem[] = [
  { title: "Bayfront Retreat", image: PLACEHOLDER, description: "A modern coastal retreat overlooking the bay." },
  { title: "Beachfront Custom", image: PLACEHOLDER, description: "A custom oceanfront residence built for everyday living." },
  { title: "Haven Hideaway", image: PLACEHOLDER, description: "A timeless family home in the heart of Ocean City." },
  { title: "Anchor Estate", image: PLACEHOLDER, description: "A multi-generational compound on a quiet Ocean City lane." },
  { title: "Drift Cottage", image: PLACEHOLDER, description: "A craftsman-detailed cottage with a generous covered porch." },
  { title: "Tide & Timber", image: PLACEHOLDER, description: "A duplex residence blending classic shingle style and modern interiors." },
];

const CardInner = ({ p }: { p: PortfolioItem }) => (
  <>
    <div className="overflow-hidden aspect-[4/3] mb-4" style={{ borderRadius: "4px" }}>
      <img
        src={p.image}
        alt={p.title}
        className="w-full h-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-90"
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
