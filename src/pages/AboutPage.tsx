import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import AboutSection from "@/components/sections/AboutSection";
import { TeamGrid } from "@/components/sections/TeamSection";
import Reveal from "@/components/Reveal";

const AboutPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="About | Halliday Architects"
      description="Halliday Architects is an architecture practice in Ocean City, New Jersey, designing custom homes, renovations, and multi-family projects."
      path="/about"
    />
    <PageHero eyebrow="Our Story" title="About Halliday Architects" />

    <AboutSection />

    <div className="w-full h-px bg-border" />

    <section className="section-padding section-sand">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <Reveal>
          <div className="text-center mb-16">
            <p className="label-uppercase mb-4">Our Team</p>
            <h2 className="heading-section text-charcoal mb-6">The Studio</h2>
            <div className="divider mx-auto mb-6" />
            <p className="text-body max-w-2xl mx-auto">
              Every project is led personally by a principal of the practice.
            </p>
          </div>
        </Reveal>
        <TeamGrid />
      </div>
    </section>

    <GlobalFooter />
  </main>
);

export default AboutPage;
