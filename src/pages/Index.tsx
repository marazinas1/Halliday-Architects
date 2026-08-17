import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import AboutSection from "@/components/sections/AboutSection";
import { ServicesGrid } from "@/components/sections/ServicesSection";
import { PortfolioGrid } from "@/components/sections/PortfolioSection";

/** Neutral placeholder until the client's photography arrives. */
const heroImg = "/placeholder.svg";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Halliday Architects | Architecture Practice in Ocean City, NJ"
        description="Halliday Architects is an architecture practice in Ocean City, New Jersey — custom homes, renovations, multi-family, and sustainable design."
        path="/"
      />

      {/* ─── Hero ─── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-muted">
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          fetchPriority="high"
          decoding="async"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <p className="label-uppercase text-white/70 mb-6">Halliday Architects</p>
          <h1 className="heading-display text-white mb-6">
            Architecture for the
            <br />
            Jersey Shore
          </h1>
          <div className="w-16 h-px bg-white/40 mx-auto mb-6" />
          <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
            Custom homes, renovations, and multi-family design — Ocean City, New Jersey.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-2 px-8 py-3 text-xs font-medium tracking-wider uppercase bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-charcoal transition-all duration-300 hover:-translate-y-0.5"
            style={{ borderRadius: "4px" }}
          >
            Start Your Project
          </Link>
        </div>
      </section>

      <div className="w-full h-px bg-border" />

      <AboutSection />

      <div className="w-full h-px bg-border" />

      {/* ─── Services preview ─── */}
      <section className="section-padding section-sand">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <Reveal>
            <div className="text-center mb-16">
              <p className="label-uppercase mb-4">What We Do</p>
              <h2 className="heading-section text-charcoal mb-6">Services</h2>
              <div className="divider mx-auto mb-6" />
              <p className="text-body max-w-2xl mx-auto">
Custom homes, renovations and additions, multi-family and mixed use, and
                sustainable design — led personally by a principal of the practice.
              </p>
            </div>
          </Reveal>
          <ServicesGrid />
          <div className="text-center mt-12">
            <Link to="/services" className="btn-outline text-xs inline-flex">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-border" />

      {/* ─── Featured projects preview ─── */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <Reveal>
            <div className="text-center mb-16">
              <p className="label-uppercase mb-4">Featured Work</p>
              <h2 className="heading-section text-charcoal mb-6">Portfolio</h2>
              <div className="divider mx-auto mb-6" />
              <p className="text-body max-w-2xl mx-auto">
                A selection of completed projects across the Ocean City, NJ area.
              </p>
            </div>
          </Reveal>
          <PortfolioGrid limit={3} />
          <div className="text-center mt-12">
            <Link to="/projects" className="btn-outline text-xs inline-flex">
              View Full Portfolio
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-border" />

      {/* ─── Contact CTA ─── */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl text-center">
          <Reveal>
            <p className="label-uppercase mb-4">Get In Touch</p>
            <h2 className="heading-section text-charcoal mb-6">Let's Design Something Lasting</h2>
            <div className="divider mx-auto mb-8" />
            <p className="text-body mb-10">
              Tell us about your project and one of our principals will be in touch shortly.
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
};

export default Index;
