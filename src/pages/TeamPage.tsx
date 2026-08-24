import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { TeamRoster } from "@/components/sections/TeamSection";
import { container, sectionPadding } from "@/lib/rhythm";

const TeamPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Our Team | Halliday Architects"
      description="Meet the people behind Halliday Architects, an architecture practice in Ocean City, New Jersey."
      path="/team"
    />
    <PageHero eyebrow="Our Team" title="The Studio" />

    <section className={`${sectionPadding.base}`}>
      <div className={container.wide}>
        <Reveal>
          <p className="text-body max-w-2xl mx-auto text-center mb-16">
            A small studio in Ocean City. Every project is led personally by a principal, from the
            first sketch to construction administration.
          </p>
        </Reveal>
        <TeamRoster />
      </div>
    </section>

    <CTASection variant="sand" />

      <GlobalFooter />
  </main>
);

export default TeamPage;
