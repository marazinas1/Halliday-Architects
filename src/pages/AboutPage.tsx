import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import AboutSection from "@/components/sections/AboutSection";
import ResponsiveImage from "@/components/ResponsiveImage";
import { TeamRoster } from "@/components/sections/TeamSection";
import Reveal from "@/components/Reveal";
import PartnersSection from "@/components/sections/PartnersSection";
import ProcessSection from "@/components/sections/ProcessSection";
import Testimonials from "@/components/sections/Testimonials";
import { usePageContent } from "@/hooks/usePageContent";
import { useResolvedPageImages } from "@/hooks/useResolvedPageImages";
import { container, sectionPadding } from "@/lib/rhythm";

const AboutPage = () => {
  const page = usePageContent();
  const { resolve } = useResolvedPageImages();

  // Either photograph may be chosen in the admin panel; anything left empty
  // keeps the project photography the page used before.
  const strip = ["strip_1", "strip_2"].map((slot) => {
    const photo = resolve("about", slot);
    return photo.url ? { url: photo.url, alt: photo.alt } : null;
  });
  const heading = page.copy("about", "heading", "Residential architecture\nin Ocean City, New Jersey");

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Christopher & Shannon Halliday | Architects"
        description="Meet architects Christopher and Shannon Halliday and their Ocean City, New Jersey studio, focused on thoughtful residential architecture."
        path="/about"
      />

      <header className="px-6 pb-4 pt-20 text-center md:pt-24">
        <p className="label-uppercase">The practice</p>
        <h1 className="mx-auto mt-4 whitespace-pre-line text-4xl font-bold leading-tight text-ink md:text-5xl">
          {heading}
        </h1>
      </header>

      <AboutSection />

      {strip.every(Boolean) && (
        <section className="grid w-full gap-[2px] md:grid-cols-[1.45fr_1fr]" aria-label="Selected project photography">
          {strip.map((photo, index) => (
            <div key={index} className="h-[46vh] min-h-[280px] overflow-hidden bg-sand md:h-[58vh] md:min-h-[380px]">
              {photo && (
                <ResponsiveImage
                  src={photo.url}
                  alt={photo.alt}
                  width={1600}
                  height={1200}
                  sizes="(min-width: 768px) 60vw, 100vw"
                  quality={82}
                  maxWidth={2400}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </section>
      )}

      <ProcessSection
        eyebrow="How we work"
        heading={page.copy(
          "about",
          "process_heading",
          "One practice, from the first site visit to the last",
        )}
      />

      <section id="studio" className={`${sectionPadding.base} scroll-mt-20 border-t border-line section-sand`}>
        <div className={container.people}>
          <Reveal>
            <div className="section-head">
              <p className="label-uppercase">The studio</p>
              <h2 className="heading-section text-ink">Led by the principals</h2>
            </div>
          </Reveal>
          <TeamRoster />
        </div>
      </section>

      <Testimonials />

      <PartnersSection />

      <CTASection />

      <GlobalFooter />
    </main>
  );
};

export default AboutPage;
