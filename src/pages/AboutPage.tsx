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
      title="About | Halliday Leonard General Contractors"
      description="Forty years of coastal craftsmanship. Halliday Leonard builds the highest-quality custom homes in the Ocean City, New Jersey area."
      path="/about"
    />
    <PageHero eyebrow="Our Story" title="About Halliday-Leonard" />

    <AboutSection />

    <div className="w-full h-px bg-border" />

    <section className="section-padding section-sand">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <Reveal>
          <div className="text-center mb-16">
            <p className="label-uppercase mb-4">Our Team</p>
            <h2 className="heading-section text-charcoal mb-6">The Partners</h2>
            <div className="divider mx-auto mb-6" />
            <p className="text-body max-w-2xl mx-auto">
              Four partners. One standard. Every project is led personally by an owner of the firm.
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
