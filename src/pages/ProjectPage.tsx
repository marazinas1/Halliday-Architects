import ResponsiveImage from "@/components/ResponsiveImage";
import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import Lightbox from "@/components/projects/Lightbox";
import PreviewBanner from "@/components/admin/PreviewBanner";
import Reveal from "@/components/Reveal";
import { previewPath, readPreview } from "@/lib/admin/preview";
import {
  PROJECT_TYPE_LABELS,
  usePublicProject,
  useProjectOrder,
  type GalleryItem,
  type ProjectType,
} from "@/hooks/usePublicProjects";
import { container } from "@/lib/rhythm";

type Spec = { label?: string; value?: string };

type GalleryRow = { kind: "full" | "pair" | "split"; items: GalleryItem[] };

const buildGalleryRows = (items: GalleryItem[]): GalleryRow[] => {
  const rows: GalleryRow[] = [];
  const pattern: GalleryRow["kind"][] = ["full", "pair", "split", "full"];
  let cursor = 0;
  let patternIndex = 0;
  while (cursor < items.length) {
    const kind = pattern[patternIndex % pattern.length];
    const count = kind === "full" ? 1 : Math.min(2, items.length - cursor);
    rows.push({ kind: count === 1 ? "full" : kind, items: items.slice(cursor, cursor + count) });
    cursor += count;
    patternIndex += 1;
  }
  return rows;
};

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
        {/* Hero-shaped skeleton: same height as the real hero, so nothing
            jumps when the photograph lands. */}
        <div
          className="h-[72svh] min-h-[420px] w-full animate-pulse bg-sand"
          aria-hidden="true"
        />
        <div className={`${container.wide} py-16`} aria-hidden="true">
          <div className="h-8 w-2/3 max-w-md animate-pulse bg-sand" />
          <div className="mt-6 h-4 w-full max-w-2xl animate-pulse bg-sand" />
          <div className="mt-3 h-4 w-4/5 max-w-xl animate-pulse bg-sand" />
        </div>
        <span className="sr-only">Loading project…</span>
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
            className="link-inline group mt-8"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to projects
          </Link>
        </div>
        <GlobalFooter />
      </main>
    );
  }

  const { project, location, heroUrl, heroAlt, gallery } = data;
  const features = Array.isArray(project.features) ? (project.features as string[]) : [];
  const specs = (Array.isArray(project.specs) ? project.specs : []) as Spec[];
  const meta = [
    PROJECT_TYPE_LABELS[project.project_type as ProjectType] ?? null,
    project.year_completed ?? null,
  ].filter(Boolean);
  const galleryRows = buildGalleryRows(gallery);

  return (
    <main className={`min-h-screen bg-background${isPreview ? " pt-9" : ""}`}>
      {isPreview && <PreviewBanner label="project page" />}
      <GlobalNav />
      {!isPreview && (
        <SEO
          title={`${project.title} | Halliday Architects`}
          description={project.tagline ?? project.description ?? project.title}
          path={`/projects/${project.slug}`}
          type="article"
          image={heroUrl ?? undefined}
        />
      )}

      <section className="relative h-[82svh] min-h-[540px] overflow-hidden bg-sand">
        {heroUrl && (
          <ResponsiveImage
            src={heroUrl}
            alt={heroAlt ?? project.title}
            width={1920}
            height={1280}
            priority
            sizes="100vw"
            quality={85}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-14">
          <div className={container.wide}>
            <Link
              to="/projects"
              className="link-inline link-inline-inverse group mb-7"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
            {meta.length > 0 && (
              <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-paper/75">
                {meta.join(" · ")}
              </span>
            )}
            <h1
              className="mt-2 text-4xl font-bold leading-none text-paper md:text-5xl lg:text-6xl"
            >
              {project.title}
            </h1>
            {location && <p className="mt-3 text-base text-paper/80">{location}</p>}
            {project.tagline && <p className="mt-3 max-w-2xl text-base font-light text-paper/75">{project.tagline}</p>}
          </div>
        </div>
      </section>

      {(project.client_brief || project.story || project.description) && (
        <Reveal>
        <section className="px-6 py-24 text-center md:py-28">
          <div className="mx-auto max-w-[56rem]">
            {project.client_brief && (
              <div>
                <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-stone">The brief</p>
                <p className="mx-auto max-w-[38ch] whitespace-pre-line text-xl font-light leading-relaxed text-ink md:text-2xl">
                  {project.client_brief}
                </p>
              </div>
            )}
            {(project.story || project.description) && (
              <div className={`${project.client_brief ? "mt-9" : ""} mx-auto max-w-[64ch] space-y-6 text-[15px] leading-[1.9] text-stone`}>
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
          </div>
        </section>
        </Reveal>
      )}

      {gallery.length > 0 && (
        <section className="flex flex-col gap-[2px]">
          {galleryRows.map((row, rowIndex) => {
            const startIndex = galleryRows.slice(0, rowIndex).reduce((total, item) => total + item.items.length, 0);
            const rowClass = row.kind === "full"
              ? "grid min-h-[460px] h-[72vh]"
              : row.kind === "pair"
                ? "grid gap-[2px] md:grid-cols-2 md:h-[56vh] md:min-h-[360px]"
                : "grid gap-[2px] md:grid-cols-[1.45fr_1fr] md:h-[60vh] md:min-h-[380px]";
            return (
              <Reveal key={`${row.kind}-${rowIndex}`}>
              <div className={rowClass}>

                {row.items.map((img, itemIndex) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setLightbox(startIndex + itemIndex)}
                    className="group min-h-[320px] w-full overflow-hidden bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink md:min-h-0"
                    aria-label={`Open image ${startIndex + itemIndex + 1}`}
                  >
                    <ResponsiveImage
                      src={img.src}
                      alt={img.alt}
                      width={1600}
                      height={1200}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      quality={82}
                      maxWidth={2000}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.02]"
                    />
                  </button>
                ))}
              </div>
              </Reveal>

            );
          })}
        </section>
      )}

      {(specs.length > 0 || features.length > 0) && (
        <Reveal>
        <section className="bg-sand py-20 md:py-24">
          <div className={`${container.content} grid gap-14 ${specs.length > 0 && features.length > 0 ? "md:grid-cols-2 md:gap-20" : ""}`}>
            {specs.length > 0 && (
              <div>
                <p className="border-b border-line pb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-stone">Details</p>
                <dl className="divide-y divide-line border-t border-line">
                  {specs.map((s, i) => (
                    <div key={i} className="flex justify-between gap-6 py-3 text-sm">
                      <dt className="font-medium text-ink">{s.label}</dt>
                      <dd className="text-right text-stone">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <p className="border-b border-line pb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-stone">Features</p>
                <ul className="divide-y divide-line text-sm text-ink">
                  {features.map((f) => (
                    <li key={f} className="py-3">{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
        </Reveal>
      )}

      {next && (
        <Link to={`/projects/${next.slug}`} className="group relative block h-[46vh] min-h-[320px] overflow-hidden bg-sand">
          {next.card_image_url && (
            <ResponsiveImage
              src={next.card_image_url}
              alt={next.card_image_alt}
              width={1600}
              height={900}
              sizes="100vw"
              quality={82}
              maxWidth={2400}
              className="h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
            />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-paper">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-paper/70">Next project</p>
            <h2 className="mt-3 text-3xl font-bold text-paper md:text-4xl">{next.title}</h2>
            <span className="link-inline link-inline-inverse group mt-5">
              View project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      )}

      <Lightbox items={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />

      <GlobalFooter />
    </main>
  );
};

export default ProjectPage;
