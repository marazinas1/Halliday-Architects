import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { PortfolioGrid } from "@/components/sections/PortfolioSection";
import { container, sectionPadding } from "@/lib/rhythm";

/** Portfolio — published projects from the database, with a deliberate empty state. */
const ProjectsPage = () => {
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
          {/* PLACEHOLDER COPY — awaiting the client's own words. */}
          <p className="text-body max-w-2xl mx-auto text-center mb-16">
            A selection of residential projects in and around Ocean City, New Jersey.
          </p>

          <PortfolioGrid />
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default ProjectsPage;
