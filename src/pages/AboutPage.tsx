import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import AboutSection from "@/components/sections/AboutSection";
import { PrincipalsGrid } from "@/components/sections/TeamSection";
import Reveal from "@/components/Reveal";
import PartnersSection from "@/components/sections/PartnersSection";
import Testimonials from "@/components/sections/Testimonials";
import { HOW_WE_WORK } from "@/content/firm";
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

    <section className={sectionPadding.base}>
      <div className={container.wide}>
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
            <p className="label-uppercase lg:col-span-3 lg:pt-3">How we work</p>
            <h2 className="heading-section text-ink lg:col-span-9 max-w-2xl">
              One practice, from the first site visit to the last site visit
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {HOW_WE_WORK.map((step, i) => (
            <Reveal key={step.title}>
              <div className="border-t border-line pt-8">
                <span className="numeral block text-5xl md:text-6xl mb-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="heading-card text-ink text-lg mb-3">{step.title}</h3>
                <p className="text-body text-sm leading-relaxed">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

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

    <Testimonials />

    <CTASection variant="light" />

      <GlobalFooter />
  </main>
);

export default AboutPage;
