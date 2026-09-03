import ResponsiveImage from "@/components/ResponsiveImage";
import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";

import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import ProjectFilters from "@/components/projects/ProjectFilters";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/admin/useTags";
import {
  PROJECT_TYPE_LABELS,
  usePublicProjects,
  type ProjectType,
} from "@/hooks/usePublicProjects";
import { getProjectRowSizes } from "@/lib/projectRows";
import { container, pageHeader } from "@/lib/rhythm";

const rowGridClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 min-[820px]:grid-cols-2",
  3: "grid-cols-1 lg:grid-cols-3",
};

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

  const projectRows = useMemo(() => {
    let projectIndex = 0;
    return getProjectRowSizes(filtered.length).map((size) => {
      const row = filtered.slice(projectIndex, projectIndex + size);
      projectIndex += size;
      return row;
    });
  }, [filtered]);

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
      <Reveal>
        <header className={pageHeader}>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">Selected work</p>
          <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">Projects</h1>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-stone">
            Residential architecture in and around Ocean City, New Jersey — new builds, renovations, additions and interiors.
          </p>
        </header>
      </Reveal>


      {(() => {
        // ProjectFilters returns null when no row offers a real choice; in
        // that case skip the section entirely so the grid sits flush under hero.
        const showTypes = availableTypes.length > 1;
        const showTags = tags.length > 1;
        if (!showTypes && !showTags) return null;
        return (
          <section className="pb-14">
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
        );
      })()}

      <section>
          {isLoading ? (
            <div className="grid gap-[2px] sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] w-full animate-pulse bg-sand" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={`${container.content} px-8 py-24 text-center`}>
              <p className="text-2xl font-light text-ink">
                {projects.length === 0 ? "Projects are on their way." : "Nothing matches yet."}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone">
                {projects.length === 0
                  ? "The portfolio is being prepared. Please check back shortly."
                  : "Try a different project type, or clear the filters to see all work."}
              </p>
              {projects.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clear}
                  className="mt-8 h-auto rounded-none px-0 text-xs uppercase tracking-[0.16em] text-ink underline underline-offset-8"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-[2px]">
              {projectRows.map((row) => {
                const rowSize = row.length;
                return (
                  <div
                    key={row.map((project) => project.id).join("-")}
                    className={`grid w-full gap-[2px] ${rowGridClasses[rowSize]}`}
                  >
                    {row.map((p, cardIndex) => (
                      <Reveal key={p.id} delay={cardIndex * 150}>
                        <Link
                          to={`/projects/${p.slug}`}
                          className="group relative block aspect-[4/3] overflow-hidden bg-sand focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
                        >
                          {p.card_image_url ? (
                            <ResponsiveImage
                              src={p.card_image_url}
                              alt={p.card_image_alt}
                              width={1600}
                              height={1200}
                              sizes={
                                rowSize === 1
                                  ? "100vw"
                                  : rowSize === 2
                                    ? "(min-width: 820px) 50vw, 100vw"
                                    : "(min-width: 1024px) 34vw, 100vw"
                              }
                              quality={82}
                              maxWidth={rowSize === 1 ? 2400 : rowSize === 2 ? 2000 : 1600}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="h-full w-full bg-sand" />
                          )}
                          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-6 text-paper md:p-8">
                            <h2 className="text-xl font-semibold leading-tight text-paper">
                              {p.title}
                            </h2>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-paper/70">
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
                      </Reveal>
                    ))}

                  </div>
                );
              })}
            </div>
          )}
      </section>

      <CTASection />

      <GlobalFooter />
    </main>
  );
};

export default ProjectsPage;
