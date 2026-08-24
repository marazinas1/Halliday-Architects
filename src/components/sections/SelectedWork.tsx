import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import {
  PROJECT_TYPE_LABELS,
  usePublicProjects,
  type ProjectType,
} from "@/hooks/usePublicProjects";
import { container, sectionPadding } from "@/lib/rhythm";

/** Number of cards surfaced on the homepage — always four slots. */
const LIMIT = 4;

type Card = {
  key: string;
  title: string;
  image: string | null;
  link: string;
  meta: string;
};

const SelectedWork = () => {
  const { data, isLoading } = usePublicProjects();
  // Single rule: the first four published projects by sort_order.
  // No placeholders: fewer than four projects simply renders fewer cards.
  const projects = (data ?? []).slice(0, LIMIT); // already ordered by sort_order

  const cards: Card[] = projects.map((p) => ({
    key: p.id,
    title: p.title,
    image: p.card_image_url ?? null,
    link: `/projects/${p.slug}`,
    meta: [
      p.location,
      PROJECT_TYPE_LABELS[p.project_type as ProjectType] ?? null,
      p.year_completed ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  if (isLoading) return null;

  return (
    <section className={`${sectionPadding.base} section-sand`}>
      <div className={container.wide}>
        <Reveal>
          <div className="section-head">
            <span className="label-uppercase">Portfolio</span>
            <h2 className="heading-section text-ink">Selected work</h2>
          </div>
        </Reveal>

        {/* Mobile: horizontal snap rail with stacked card. */}
        <div className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar -mr-6 pr-6 pb-2 gap-4 md:hidden">
          {cards.map((card, i) => (
            <Reveal key={card.key} delay={i * 100} className="w-[85%] shrink-0 snap-center">
              <Link to={card.link} className="block">
                <div className="flex flex-col overflow-hidden border border-line bg-paper">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      className="block w-full aspect-[4/5] object-cover object-center"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full bg-sand" />
                  )}
                  <div className="w-full p-6">
                    {card.meta ? (
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-stone">
                        {card.meta}
                      </span>
                    ) : null}
                    <h3 className="heading-card text-ink">{card.title}</h3>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Desktop: 2-up / 4-up grid, dark veil rising on hover. */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <Reveal key={card.key} delay={i * 100}>
              <Link to={card.link} className="block">
                <div className="group relative aspect-[4/5] overflow-hidden bg-sand cursor-pointer">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  {/* Dark veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Caption */}
                  <div className="absolute inset-x-0 bottom-0 p-6 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {card.meta ? (
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-paper/70">
                        {card.meta}
                      </span>
                    ) : null}
                    <h3 className="heading-card text-paper">{card.title}</h3>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="below-link">
            <Link to="/projects" className="link-inline">
              View all work
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SelectedWork;
