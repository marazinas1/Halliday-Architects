import { Link } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ServicesSection from "@/components/sections/ServicesSection";
import { container, sectionPadding } from "@/lib/rhythm";

const ServicesPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Services | Halliday Architects"
      description="Architectural consultation, design, code analysis, and permit coordination from Halliday Architects in Ocean City, NJ."
      path="/services"
    />
    <PageHero eyebrow="What We Do" title="Services" />

    <ServicesSection heading="Services" />

    <section className={`${sectionPadding.base}`}>
      <div className={`${container.narrow} text-center`}>
        <Reveal>
          <h2 className="heading-section text-ink mb-6">Get in touch</h2>
          <div className="divider mx-auto mb-8" />
          {/* PLACEHOLDER COPY — awaiting the client's own words. */}
          <p className="text-body mb-10">
            Tell us about your site and what you have in mind, and we will reply personally.
          </p>
          <Link to="/contact" className="btn-primary inline-flex">
            Contact the studio
          </Link>
        </Reveal>
      </div>
    </section>

    <GlobalFooter />
  </main>
);

export default ServicesPage;
