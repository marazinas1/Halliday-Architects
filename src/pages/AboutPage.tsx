import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import AboutSection from "@/components/sections/AboutSection";
import { TeamRoster } from "@/components/sections/TeamSection";
import Reveal from "@/components/Reveal";
import PartnersSection from "@/components/sections/PartnersSection";
import ProcessSection from "@/components/sections/ProcessSection";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { container, sectionPadding } from "@/lib/rhythm";

const AboutPage = () => {
  const { data: projects = [] } = usePublicProjects();
  const stripProjects = projects.length >= 2 ? projects.slice(-2) : [];

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Christopher & Shannon Halliday | Architects"
        description="Meet architects Christopher and Shannon Halliday and their Ocean City, New Jersey studio, focused on thoughtful residential architecture."
        path="/about"
      />

      <header className="px-6 pb-4 pt-20 text-center md:pt-24">
        <p className="label-uppercase">The practice</p>
        <h1 className="mx-auto mt-4 text-4xl font-bold leading-tight text-ink md:text-5xl">
          Residential architecture
          <br />
          in Ocean City, New Jersey
        </h1>
      </header>

      <AboutSection />

      {stripProjects.length === 2 && (
        <section className="grid w-full gap-[2px] md:grid-cols-[1.45fr_1fr]" aria-label="Selected project photography">
          {stripProjects.map((project) => (
            <div key={project.id} className="h-[46vh] min-h-[280px] overflow-hidden bg-sand md:h-[58vh] md:min-h-[380px]">
              {project.card_image_url && (
                <img
                  src={project.card_image_url}
                  alt={project.card_image_alt}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </section>
      )}

      <ProcessSection
        eyebrow="How we work"
        heading="One practice, from the first site visit to the last"
      />

      <section id="studio" className={`${sectionPadding.base} scroll-mt-20 border-t border-line section-sand`}>
        <div className={container.people}>
          <Reveal>
            <div className="section-head">
              <p className="label-uppercase">The studio</p>
              <h2 className="heading-section text-ink">Led by the principals</h2>
            </div>
          </Reveal>
          <TeamRoster />
        </div>
      </section>

      <PartnersSection />

      <CTASection variant="light" />

      <GlobalFooter />
    </main>
  );
};

export default AboutPage;
