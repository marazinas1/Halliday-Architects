import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { container, gap, sectionPadding } from "@/lib/rhythm";

/** Number of projects surfaced on the homepage. */
const LIMIT = 6;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="aspect-[4/3] w-full overflow-hidden bg-sand" style={{ borderRadius: "4px" }}>
    {children}
  </div>
);

const Skeleton = () => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap.grid}`}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i}>
        <Frame>{null}</Frame>
        <div className="mt-5 h-3 w-1/2 bg-sand" />
        <div className="mt-3 h-2 w-1/3 bg-sand" />
      </div>
    ))}
  </div>
);

/** Deliberate empty state — the portfolio is entered through the admin panel. */
const Empty = () => (
  <div
    className="border border-line px-8 py-20 text-center"
    style={{ borderRadius: "4px" }}
  >
    <p className="text-body max-w-md mx-auto">
      Selected projects are being prepared for the new site.
    </p>
    <Link
      to="/projects"
      className="mt-6 inline-block label-uppercase text-ink hover:text-brand"
    >
      View the portfolio
    </Link>
  </div>
);

const SelectedWork = () => {
  const { data, isLoading } = usePublicProjects();
  const projects = (data ?? []).slice(0, LIMIT);

  return (
    <section className={sectionPadding.base}>
      <div className={container.wide}>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-14 lg:mb-20">
            <h2 className="heading-section text-ink">Selected work</h2>
            <Link to="/projects" className="label-uppercase text-ink hover:text-brand">
              All projects
            </Link>
          </div>
        </Reveal>

        {isLoading ? (
          <Skeleton />
        ) : projects.length === 0 ? (
          <Empty />
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap.grid}`}>
            {projects.map((p) => (
              <Reveal key={p.id}>
                <Link to={`/projects/${p.slug}`} className="group block">
                  <Frame>
                    {p.card_image_url ? (
                      <img
                        src={p.card_image_url}
                        alt={p.title}
                        className="w-full h-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-90"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </Frame>
                  <h3 className="heading-card text-ink text-lg mt-5 group-hover:text-brand transition-colors">
                    {p.title}
                  </h3>
                  {p.location ? <p className="text-small mt-1">{p.location}</p> : null}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SelectedWork;
