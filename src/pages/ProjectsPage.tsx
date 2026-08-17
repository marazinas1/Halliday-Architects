import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { PortfolioGrid } from "@/components/sections/PortfolioSection";
import { usePublicProjects } from "@/hooks/usePublicProjects";

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
        title="Featured Projects | Halliday Leonard"
        description="A portfolio of custom homes and developments built by Halliday Leonard in the Ocean City, NJ area."
        path="/projects"
      />
      <PageHero eyebrow="Featured Work" title="Portfolio" />

      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <p className="text-body max-w-2xl mx-auto text-center mb-16">
            A selection of completed custom homes and developments across the Ocean City, NJ area.
          </p>

          {isLoading ? <p className="text-center text-small py-16">Loading…</p> : <PortfolioGrid />}
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default ProjectsPage;
