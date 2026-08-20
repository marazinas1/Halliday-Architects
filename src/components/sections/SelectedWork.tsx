import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
    <section className={`${sectionPadding.tight} section-sand`}>
      <div className={container.wide}>
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="label-uppercase mb-4 block">
              Portfolio
            </span>
            <h2 className="heading-section text-ink">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {cards.map((card) => (
            <Reveal key={card.key}>
              <Link to={card.link} className="group block">
                <div className="overflow-hidden bg-sand">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full bg-sand" />
                  )}
                </div>
                <div className="mt-5">
                  <h3 className="heading-card text-ink">
                    {card.title}
                  </h3>
                  {card.meta ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone">
                      {card.meta}
                    </p>
                  ) : null}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SelectedWork;
