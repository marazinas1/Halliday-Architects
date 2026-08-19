import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { container, gap, sectionPadding } from "@/lib/rhythm";

/** Number of cards surfaced on the homepage — always four slots. */
const LIMIT = 4;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative aspect-[4/5] w-full overflow-hidden bg-sand"
    style={{ borderRadius: "4px" }}
  >
    {children}
  </div>
);

/** Quiet slot shown while the remaining projects are being added. */
const PlaceholderCard = () => (
  <Frame>
    <div className="absolute inset-0 flex items-end p-6">
      <span className="label-uppercase text-stone/60">In preparation</span>
    </div>
  </Frame>
);

const SelectedWork = () => {
  const { data, isLoading } = usePublicProjects();
  const projects = (data ?? []).slice(0, LIMIT);
  const placeholders = Math.max(0, LIMIT - projects.length);

  return (
    <section className={sectionPadding.base}>
      <div className={container.wide}>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-14 lg:mb-20">
            <h2 className="heading-section text-ink">Selected work</h2>
            <Link to="/projects" className="label-uppercase text-ink link-underline">
              View all work
            </Link>
          </div>
        </Reveal>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${gap.grid}`}>
          {projects.map((p) => (
            <Reveal key={p.id}>
              <Link to={`/projects/${p.slug}`} className="group block">
                <Frame>
                  {p.card_image_url ? (
                    <img
                      src={p.card_image_url}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  {/* Title reveals on hover, exactly like the reference grid. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    {p.location ? (
                      <span className="label-uppercase text-paper/70 block mb-2">{p.location}</span>
                    ) : null}
                    <h3 className="heading-card text-paper text-xl">{p.title}</h3>
                  </div>
                </Frame>
              </Link>
            </Reveal>
          ))}

          {!isLoading &&
            Array.from({ length: placeholders }).map((_, i) => (
              <Reveal key={`placeholder-${i}`}>
                <PlaceholderCard />
              </Reveal>
            ))}

          {isLoading &&
            Array.from({ length: LIMIT }).map((_, i) => (
              <div key={`skeleton-${i}`}>
                <Frame>{null}</Frame>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default SelectedWork;
