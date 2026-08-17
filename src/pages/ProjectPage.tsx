import { useParams, Link } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import { usePublicProject } from "@/hooks/usePublicProjects";

/**
 * Public project detail page — a simple showcase (hero, story, features,
 * gallery). Content and styling get their full treatment in the rebuild step.
 */
const ProjectPage = () => {
  const { slug } = useParams();
  const { data, isLoading } = usePublicProject(slug);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <GlobalNav />
        <div className="py-40 text-center text-small">Loading…</div>
        <GlobalFooter />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-background">
        <GlobalNav />
        <div className="py-40 text-center">
          <h1 className="heading-section text-charcoal mb-4">Project not found</h1>
          <Link to="/projects" className="btn-outline text-xs inline-flex">
            Back to projects
          </Link>
        </div>
        <GlobalFooter />
      </main>
    );
  }

  const { project, location, heroUrl, gallery } = data;
  const features = Array.isArray(project.features) ? (project.features as string[]) : [];

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title={`${project.title} | Halliday Architects`}
        description={project.tagline ?? project.description ?? project.title}
        path={`/projects/${project.slug}`}
      />

      <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
        {heroUrl && (
          <img
            src={heroUrl}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          {location && <p className="label-uppercase text-white/70 mb-3">{location}</p>}
          <h1 className="heading-display text-white">{project.title}</h1>
          {project.tagline && (
            <p className="text-white/80 mt-4 max-w-2xl font-light">{project.tagline}</p>
          )}
        </div>
      </section>

      {project.description && (
        <section className="section-padding">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl">
            {project.headline && (
              <h2 className="heading-section text-charcoal mb-6">{project.headline}</h2>
            )}
            <p className="text-body whitespace-pre-line">{project.description}</p>
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section className="section-padding section-sand">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
            <h2 className="heading-section text-charcoal mb-8">Features</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <li key={f} className="text-body text-sm">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="section-padding">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <h2 className="heading-section text-charcoal mb-8">Gallery</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((img) => (
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <GlobalFooter />
    </main>
  );
};

export default ProjectPage;
