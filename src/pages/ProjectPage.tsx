import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import Lightbox from "@/components/projects/Lightbox";
import Reveal from "@/components/Reveal";
import PreviewBanner from "@/components/admin/PreviewBanner";
import { previewPath, readPreview } from "@/lib/admin/preview";
import {
  PROJECT_TYPE_LABELS,
  usePublicProject,
  useProjectOrder,
  type ProjectType,
} from "@/hooks/usePublicProjects";
import { container, sectionPadding } from "@/lib/rhythm";

type Spec = { label?: string; value?: string };

/**
 * Layout pattern for the gallery: images cycle through full, half and
 * two-thirds widths so strong photographs get room rather than sitting in a
 * uniform grid.
 */
const SPANS = ["md:col-span-12", "md:col-span-6", "md:col-span-6", "md:col-span-8", "md:col-span-4"];
const RATIOS = ["aspect-[16/9]", "aspect-[4/3]", "aspect-[4/3]", "aspect-[3/2]", "aspect-[3/4]"];

const ProjectPage = () => {
  const { slug } = useParams();
  const routeLocation = useLocation();
  // Preview mode renders unsaved admin form state instead of the database row.
  const isPreview = routeLocation.pathname === previewPath("project");
  const previewData = useMemo(
    () => (isPreview ? readPreview<ReturnType<typeof usePublicProject>["data"]>("project") : null),
    [isPreview],
  );
  const query = usePublicProject(isPreview ? undefined : slug);
  const data = isPreview ? previewData : query.data;
  const isLoading = isPreview ? false : query.isLoading;
  const { data: order = [] } = useProjectOrder();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const next = useMemo(() => {
    if (isPreview || !slug || order.length < 2) return null;
    const i = order.findIndex((p) => p.slug === slug);
    if (i === -1) return null;
    return order[(i + 1) % order.length];
  }, [order, slug, isPreview]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <GlobalNav />
        <div className="py-40 text-center text-sm text-stone">Loading…</div>
        <GlobalFooter />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-background">
        <GlobalNav />
        <div className="py-40 text-center">
          <h1 className="font-serif text-3xl font-light text-ink">
            {isPreview ? "No preview data" : "Project not found"}
          </h1>
          {isPreview && (
            <p className="mt-4 text-sm text-stone">
              Open this from the project form's Preview button.
            </p>
          )}
          <Link
            to="/projects"
            className="mt-8 inline-flex text-xs uppercase tracking-[0.16em] text-ink underline underline-offset-8"
          >
            Back to projects
          </Link>
        </div>
        <GlobalFooter />
      </main>
    );
  }

  const { project, location, heroUrl, gallery } = data;
  const features = Array.isArray(project.features) ? (project.features as string[]) : [];
  const specs = (Array.isArray(project.specs) ? project.specs : []) as Spec[];
  const meta = [
    location,
    PROJECT_TYPE_LABELS[project.project_type as ProjectType] ?? null,
    project.year_completed ?? null,
  ].filter(Boolean);

  return (
    <main className={`min-h-screen bg-background${isPreview ? " pt-9" : ""}`}>
      {isPreview && <PreviewBanner label="project page" />}
      <GlobalNav />
      {!isPreview && (
        <SEO
          title={`${project.title} | Halliday Architects`}
          description={project.tagline ?? project.description ?? project.title}
          path={`/projects/${project.slug}`}
        />
      )}

      {/* Hero — image fading into the page on a white gradient */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
        {heroUrl && (
          <img
            src={heroUrl}
            alt={project.title}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container-wide animate-fade-in-up">
            <Link
              to="/projects"
              className="mb-6 inline-flex items-center gap-2 text-sm text-body transition-colors hover:text-headline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
            {meta.length > 0 && (
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-widest text-caption">
                {meta.join(" · ")}
              </span>
            )}
            <h1
              className="mb-4 text-4xl font-extrabold tracking-tight text-headline md:text-5xl lg:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              {project.title}
            </h1>
            {project.tagline && (
              <p className="max-w-2xl text-lg font-light text-headline/80">{project.tagline}</p>
            )}
          </div>
        </div>
      </section>

      <div className="border-b border-border" />

      {(project.client_brief || project.story || project.description) && (
        <section className={sectionPadding.base}>
          <Reveal className={`${container.narrow} space-y-12`}>
            {project.client_brief && (
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.18em] text-stone">The brief</p>
                <p className="whitespace-pre-line text-lg font-light leading-relaxed text-ink">
                  {project.client_brief}
                </p>
              </div>
            )}
            {(project.story || project.description) && (
              <div className="space-y-6 text-base leading-[1.7] text-stone">
                {(project.story || project.description || "")
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {para}
                    </p>
                  ))}
              </div>
            )}
          </Reveal>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="pb-24 md:pb-32">
          <div className={container.wide}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
              {gallery.map((img, i) => (
                <Reveal key={img.id} delay={(i % 3) * 90} className={SPANS[i % SPANS.length]}>
                <button
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="group block overflow-hidden bg-sand w-full"
                  aria-label={`Open image ${i + 1}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className={`w-full ${RATIOS[i % RATIOS.length]} object-cover transition-opacity duration-500 group-hover:opacity-90`}
                  />
                </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {(specs.length > 0 || features.length > 0) && (
        <section className={`${sectionPadding.tight} bg-sand`}>
          <Reveal className={`${container.content} grid gap-14 md:grid-cols-2`}>
            {specs.length > 0 && (
              <div>
                <p className="mb-6 text-xs uppercase tracking-[0.18em] text-stone">Details</p>
                <dl className="divide-y divide-line border-t border-line">
                  {specs.map((s, i) => (
                    <div key={i} className="flex justify-between gap-6 py-3 text-sm">
                      <dt className="text-stone">{s.label}</dt>
                      <dd className="text-right text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <p className="mb-6 text-xs uppercase tracking-[0.18em] text-stone">Features</p>
                <ul className="space-y-3 border-t border-line pt-3 text-sm text-ink">
                  {features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </section>
      )}

      {next && (
        <section className={sectionPadding.tight}>
          <div className={container.wide}>
            <Reveal><Link to={`/projects/${next.slug}`} className="group block border-t border-line pt-8">
              <p className="text-xs uppercase tracking-[0.18em] text-stone">Next project</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-ink transition-colors duration-300 group-hover:text-brand md:text-4xl">
                {next.title}
              </h2>
            </Link></Reveal>
          </div>
        </section>
      )}

      <Lightbox items={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />

      <GlobalFooter />
    </main>
  );
};

export default ProjectPage;
