import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ProjectFilters from "@/components/projects/ProjectFilters";
import { useTags } from "@/hooks/admin/useTags";
import {
  PROJECT_TYPE_LABELS,
  usePublicProjects,
  type ProjectType,
} from "@/hooks/usePublicProjects";
import { container, gap, sectionPadding } from "@/lib/rhythm";

/** Portfolio index — image-led grid with type and tag filtering. */
const ProjectsPage = () => {
  const { data: projects = [], isLoading } = usePublicProjects();
  const { data: allTags = [] } = useTags();
  const [activeType, setActiveType] = useState<ProjectType | "all">("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const availableTypes = useMemo(
    () => [...new Set(projects.map((p) => p.project_type))] as ProjectType[],
    [projects],
  );

  // Only offer tags that actually appear on published work.
  const usedTagSlugs = useMemo(
    () => new Set(projects.flatMap((p) => p.tag_slugs)),
    [projects],
  );
  const tags = useMemo(
    () => allTags.filter((t) => usedTagSlugs.has(t.slug)),
    [allTags, usedTagSlugs],
  );

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (activeType !== "all" && p.project_type !== activeType) return false;
        return activeTags.every((slug) => p.tag_slugs.includes(slug));
      }),
    [projects, activeType, activeTags],
  );

  const toggleTag = (slug: string) =>
    setActiveTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const clear = () => {
    setActiveType("all");
    setActiveTags([]);
  };

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Projects | Halliday Architects"
        description="Residential architecture in and around Ocean City, New Jersey — new builds, renovations, additions and interiors."
        path="/projects"
      />
      <PageHero eyebrow="Selected work" title="Projects" />

      <section className={sectionPadding.tight}>
        <div className={container.wide}>
          <ProjectFilters
            types={availableTypes}
            activeType={activeType}
            onType={setActiveType}
            tags={tags}
            activeTags={activeTags}
            onToggleTag={toggleTag}
            onClear={clear}
          />
        </div>
      </section>

      <section className="pb-24 md:pb-32 lg:pb-40">
        <div className={container.wide}>
          {isLoading ? (
            <div className={`grid sm:grid-cols-2 ${gap.grid}`}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] w-full animate-pulse bg-sand" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-line px-8 py-24 text-center">
              <p className="font-serif text-2xl font-light text-ink">
                {projects.length === 0 ? "Projects are on their way." : "Nothing matches yet."}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone">
                {projects.length === 0
                  ? "The portfolio is being prepared. Please check back shortly."
                  : "Try a different project type, or clear the filters to see all work."}
              </p>
              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="mt-8 text-xs uppercase tracking-[0.16em] text-ink underline underline-offset-8"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid sm:grid-cols-2 ${gap.grid}`}>
              {filtered.map((p) => (
                <Link key={p.id} to={`/projects/${p.slug}`} className="group block">
                  <div className="overflow-hidden bg-sand">
                    {p.card_image_url ? (
                      <img
                        src={p.card_image_url}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-sand" />
                    )}
                  </div>
                  <div className="mt-5">
                    <h2 className="font-serif text-2xl font-light leading-tight text-ink">
                      {p.title}
                    </h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone">
                      {[
                        p.location,
                        PROJECT_TYPE_LABELS[p.project_type as ProjectType] ?? null,
                        p.year_completed ?? null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection variant="light" />

      <GlobalFooter />
    </main>
  );
};

export default ProjectsPage;
