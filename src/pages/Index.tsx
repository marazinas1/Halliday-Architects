import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import SelectedWork from "@/components/sections/SelectedWork";
import ServicesPreview from "@/components/sections/ServicesPreview";
import StudioPreview from "@/components/sections/StudioPreview";
import { container, sectionPadding } from "@/lib/rhythm";

/*
 * PLACEHOLDER COPY — awaiting the client's own words.
 * Everything written here is factually defensible (a residential architecture
 * practice in Ocean City, New Jersey) and deliberately says less rather than
 * claiming services we have no evidence for.
 */

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <GlobalNav lightHero />
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/"
      />

      {/*
        Hero — flat sand block at 16:9 stands in for the photography the client
        is sending. No scrim until a real image sits behind it.
      */}
      <section className="bg-sand">
        <div className={`${container.wide} min-h-[70vh] md:min-h-[80vh] flex items-end pt-32 pb-16 md:pb-24`}>
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="heading-display text-ink">
              Residential architecture
              <br className="hidden md:block" />{" "}
              in Ocean City, New Jersey
            </h1>
            <p className="text-body mt-8 max-w-xl">
              Halliday Architects — Christopher and Shannon Halliday, RA, LEED AP.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 h-12 px-8 rounded bg-ink text-paper text-sm font-medium uppercase tracking-[0.1em] transition-all duration-300 hover:opacity-90"
              >
                Start a project
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center justify-center h-12 px-8 rounded border border-line text-ink text-sm font-medium uppercase tracking-[0.1em] transition-colors duration-300 hover:bg-sand"
              >
                View our work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Introduction — placeholder, awaiting the client's own words ─── */}
      <section className={sectionPadding.base}>
        <div className={container.wide}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
            <p className="label-uppercase lg:col-span-3 lg:pt-4">The practice</p>
            <div className="lg:col-span-9">
              <Reveal>
                <p className="font-serif font-light text-3xl md:text-4xl lg:text-5xl leading-[1.15] text-ink max-w-3xl">
                  Halliday Architects is a residential architecture practice based in
                  Ocean City, New Jersey.
                </p>
                <p className="text-body mt-10 max-w-xl">
                  The practice is led by Christopher and Shannon Halliday, both
                  registered architects and LEED accredited professionals, working
                  with homeowners along the New Jersey shore.
                </p>
                <Link
                  to="/about"
                  className="mt-10 inline-block label-uppercase text-ink link-underline"
                >
                  About the practice
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-border" />

      <SelectedWork />

      <ServicesPreview />

      <StudioPreview />

      {/* ─── Practice statement — placeholder, awaiting the client's own words ─── */}
      <section className={`${sectionPadding.loose} bg-ink`}>
        <div className={container.content}>
          <Reveal>
            <p className="font-serif font-light text-3xl md:text-4xl leading-snug text-paper max-w-3xl">
              Every project begins with the site, the light and the way a family
              intends to live in the house.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Closing call to action ─── */}
      <CTASection
        variant="sand"
        eyebrow="Get in touch"
        heading="Start a project with us"
        description="Tell us about your site and what you have in mind, or call the studio on 609.957.6789. Every enquiry is answered personally."
      />

      <GlobalFooter />
    </main>
  );
};

export default Index;
