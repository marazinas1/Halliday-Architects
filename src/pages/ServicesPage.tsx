import { Link } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ServicesSection from "@/components/sections/ServicesSection";

const ServicesPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Services | Halliday Architects"
      description="Custom homes, renovations, multi-family, and sustainable design from Halliday Architects in Ocean City, NJ."
      path="/services"
    />
    <PageHero eyebrow="What We Do" title="Services" />

    <ServicesSection heading="How We Build" />

    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl text-center">
        <Reveal>
          <h2 className="heading-section text-charcoal mb-6">Start Your Project</h2>
          <div className="divider mx-auto mb-8" />
          <p className="text-body mb-10">
            Tell us about your site, your timeline, and your vision — we'll take it from there.
          </p>
          <Link to="/contact" className="btn-primary inline-flex">
            Request a Consultation
          </Link>
        </Reveal>
      </div>
    </section>

    <GlobalFooter />
  </main>
);

export default ServicesPage;
