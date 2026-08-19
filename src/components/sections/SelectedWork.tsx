import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { usePublicProjects } from "@/hooks/usePublicProjects";

/** Number of cards surfaced on the homepage — always four slots. */
const LIMIT = 4;

type Card = {
  key: string;
  title: string;
  category: string;
  image: string | null;
  link: string | null;
};

/** Mobile card: strict vertical stack, image on top, content below. */
const MobileProjectCard = ({ card }: { card: Card }) => {
  const body = (
    <div className="flex flex-col overflow-hidden rounded-[4px] border border-border bg-card">
      {card.image ? (
        <img
          src={card.image}
          alt={`${card.title} — ${card.category}`}
          className="block w-full aspect-[3/4] object-cover object-center"
          loading="lazy"
        />
      ) : (
        <div className="block w-full aspect-[3/4] bg-sand" />
      )}
      <div className="block static w-full bg-card p-6">
        <span className="text-xs font-sans font-normal uppercase tracking-widest text-stone mb-2 block">
          {card.category}
        </span>
        <h3
          className="text-2xl font-serif font-light text-ink mb-3"
          style={{ letterSpacing: "-0.02em" }}
        >
          {card.title}
        </h3>
        {card.link ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            View project
            <ArrowRight className="w-4 h-4" />
          </span>
        ) : null}
      </div>
    </div>
  );

  return card.link ? (
    <Link to={card.link} className="block">
      {body}
    </Link>
  ) : (
    <div className="block">{body}</div>
  );
};

const SelectedWork = () => {
  const { data, isLoading } = usePublicProjects();
  // Featured projects lead, in their sort order. Any remaining slots fill with
  // the most recent published projects so the grid is never half empty — and
  // the /projects ordering stays untouched.
  const all = data ?? [];
  const featured = all.filter((p) => p.featured).slice(0, LIMIT);
  const chosen = new Set(featured.map((p) => p.id));
  const filler = all
    .filter((p) => !chosen.has(p.id))
    .slice()
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const projects = [...featured, ...filler].slice(0, LIMIT);

  const cards: Card[] = [
    ...projects.map((p) => ({
      key: p.id,
      title: p.title,
      category: p.location ?? "",
      image: p.card_image_url ?? null,
      link: `/projects/${p.slug}`,
    })),
    ...Array.from({ length: Math.max(0, LIMIT - projects.length) }, (_, i) => ({
      key: `placeholder-${i}`,
      title: "In preparation",
      category: "",
      image: null,
      link: null,
    })),
  ];

  if (isLoading) return null;

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-sm font-sans font-medium uppercase tracking-widest text-stone mb-4 block">
              Portfolio
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-ink">
              Selected work
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:gap-3 transition-all"
          >
            View all work
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-6">
          {cards.map((card) => (
            <MobileProjectCard key={card.key} card={card} />
          ))}
        </div>

        {/* Desktop: grid with hover overlays */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const inner = (
              <div className="group relative aspect-[4/5] overflow-hidden rounded-[4px] cursor-pointer bg-sand">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={`${card.title} — ${card.category}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-[4px]"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-xs font-medium uppercase tracking-wider text-stone block mb-2">
                    {card.category}
                  </span>
                  <h3 className="text-xl font-serif font-light text-ink">{card.title}</h3>
                </div>
              </div>
            );
            return card.link ? (
              <Link key={card.key} to={card.link}>
                <Reveal>{inner}</Reveal>
              </Link>
            ) : (
              <Reveal key={card.key}>{inner}</Reveal>
            );
          })}
        </div>

        <Reveal className="flex justify-center mt-12">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3 border border-ink/20 rounded-[4px] text-sm font-medium text-ink hover:bg-ink hover:text-paper transition-all duration-300"
          >
            Explore more work
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default SelectedWork;
