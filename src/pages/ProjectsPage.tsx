import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { PortfolioGrid } from "@/components/sections/PortfolioSection";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Featured Projects — one combined portfolio grid.
 * Falls back to the curated static portfolio until projects are added in the admin panel.
 */
const ProjectsPage = () => {
  const { isLoading } = usePublicProjects();

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Featured Projects | Halliday Architects"
        description="A portfolio of homes and buildings designed by Halliday Architects in the Ocean City, NJ area."
        path="/projects"
      />
      <PageHero eyebrow="Featured Work" title="Portfolio" />

      <section className={`${sectionPadding.base}`}>
        <div className={container.wide}>
          <p className="text-body max-w-2xl mx-auto text-center mb-16">
            A selection of completed projects across the Ocean City, NJ area.
          </p>

          {isLoading ? <p className="text-center text-small py-16">Loading…</p> : <PortfolioGrid />}
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default ProjectsPage;
