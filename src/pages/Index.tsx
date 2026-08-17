import { Link } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
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

      {/* ─── Closing ─── */}
      <section className={`${sectionPadding.base} section-sand`}>
        <div className={container.wide}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
            <p className="label-uppercase lg:col-span-3 lg:pt-4">Contact</p>
            <div className="lg:col-span-9">
              <Reveal>
                <h2 className="heading-display text-ink">Get in touch</h2>
                <p className="text-body mt-8 max-w-xl">
                  We are glad to hear about projects along the shore. Call the studio
                  or send a note and we will reply personally.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-10">
                  <Link to="/contact" className="label-uppercase text-ink link-underline">
                    Contact
                  </Link>
                  <a href="tel:6099576789" className="label-uppercase text-ink link-underline">
                    609.957.6789
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
};

export default Index;
