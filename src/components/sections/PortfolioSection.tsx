import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { gap } from "@/lib/rhythm";

/**
 * Portfolio grid — reads published projects from the database, exactly like
 * the homepage Selected work section. No invented project data.
 */

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

/** Deliberate empty state — matches the homepage treatment. */
const Empty = () => (
  <div className="border border-line px-8 py-20 text-center" style={{ borderRadius: "4px" }}>
    <p className="text-body max-w-md mx-auto">
      Selected projects are being prepared for the new site.
    </p>
    <Link to="/contact" className="mt-6 inline-block label-uppercase text-ink hover:text-brand">
      Get in touch
    </Link>
  </div>
);

export const PortfolioGrid = ({ limit }: { limit?: number }) => {
  const { data, isLoading } = usePublicProjects();
  const projects = limit ? (data ?? []).slice(0, limit) : (data ?? []);

  if (isLoading) return <Skeleton />;
  if (projects.length === 0) return <Empty />;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap.grid}`}>
      {projects.map((p) => (
        <Reveal key={p.id}>
          <Link to={`/projects/${p.slug}`} className="group block">
            <Frame>
              {p.card_image_url ? (
                <img
                  src={p.card_image_url}
                  alt={p.card_image_alt}
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
  );
};

export default PortfolioGrid;
