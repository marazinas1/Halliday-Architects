import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import AboutSection from "@/components/sections/AboutSection";
import { PrincipalsGrid } from "@/components/sections/TeamSection";
import Reveal from "@/components/Reveal";
import PartnersSection from "@/components/sections/PartnersSection";
import { Link } from "react-router-dom";
import { container, sectionPadding } from "@/lib/rhythm";

const AboutPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="About | Halliday Architects"
      description="Halliday Architects is an architecture practice in Ocean City, New Jersey, working on residential architecture along the shore."
      path="/about"
    />
    <PageHero eyebrow="Our Story" title="About Halliday Architects" />

    <AboutSection />

    <div className="w-full h-px bg-border" />

    <section className={`${sectionPadding.base} section-sand`}>
      <div className={container.wide}>
        <Reveal>
          <div className="text-center mb-16">
            <p className="label-uppercase mb-4">Leadership</p>
            <h2 className="heading-section text-ink mb-6">Led by the principals</h2>
            <div className="divider mx-auto mb-6" />
            <p className="text-body max-w-2xl mx-auto">
              Christopher and Shannon Halliday lead the practice, and every project is led
              personally by one of them, from the first sketch through construction administration.
            </p>
          </div>
        </Reveal>
        <PrincipalsGrid />
        <Reveal>
          <div className="text-center mt-16">
            <Link to="/team" className="btn-outline text-xs inline-flex">
              Meet the full studio
            </Link>
          </div>
        </Reveal>
      </div>
    </section>

    <div className="w-full h-px bg-border" />

    <PartnersSection />

    <CTASection variant="light" />

      <GlobalFooter />
  </main>
);

export default AboutPage;
