import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import SelectedWork from "@/components/sections/SelectedWork";
import ServicesPreview from "@/components/sections/ServicesPreview";
import StudioPreview from "@/components/sections/StudioPreview";
import PreviewBanner from "@/components/admin/PreviewBanner";
import { container, sectionPadding } from "@/lib/rhythm";
import {
  resolveHomepage,
  useSiteSettings,
  type SiteSettingsRow,
} from "@/hooks/useSiteSettings";
import { readPreview } from "@/lib/admin/preview";

/*
 * Hero and introduction copy come from site_settings, edited at /admin/homepage.
 * Every field falls back to HOMEPAGE_FALLBACKS when empty, so the page never
 * renders blank.
 */

const Index = () => {
  const { pathname } = useLocation();
  const isPreview = pathname === "/admin/preview/homepage";
  const { settings } = useSiteSettings();
  const previewRow = isPreview ? readPreview<Partial<SiteSettingsRow>>("homepage") : null;
  const content = isPreview ? resolveHomepage(previewRow) : settings.homepage;

  // A hero that referenced a since-deleted project image must not leave a
  // broken frame — treat a failed load exactly like no image at all.
  const [heroFailed, setHeroFailed] = useState(false);
  const heroUrl = content.heroImageUrl && !heroFailed ? content.heroImageUrl : null;

  return (
    <main className="min-h-screen bg-background">
      {isPreview && <PreviewBanner label="homepage" />}
      <GlobalNav lightHero />
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/"
      />

      {/* Hero — photography when set, otherwise the plain sand block. */}
      <section className={`relative ${heroUrl ? "bg-ink" : "bg-sand"}`}>
        {heroUrl && (
          <>
            <img
              src={heroUrl}
              alt=""
              aria-hidden="true"
              onError={() => setHeroFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Scrim for legibility, then the white fade the project heroes use. */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-ink/40" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </>
        )}
        <div
          className={`relative ${container.wide} min-h-[70vh] md:min-h-[80vh] flex items-end pt-32 pb-16 md:pb-24`}
        >
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className={`heading-display ${heroUrl ? "text-background" : "text-ink"}`}>
              {content.heroHeadline}
            </h1>
            <p
              className={`mt-8 max-w-xl text-base leading-relaxed ${heroUrl ? "text-background/85" : "text-stone"}`}
            >
              {content.heroSubline}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className={`group inline-flex items-center justify-center gap-2 h-12 px-8 rounded text-sm font-medium uppercase tracking-[0.1em] transition-all duration-300 hover:opacity-90 ${
                  heroUrl ? "bg-background text-ink" : "bg-ink text-paper"
                }`}
              >
                Start a project
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/projects"
                className={`inline-flex items-center justify-center h-12 px-8 rounded border text-sm font-medium uppercase tracking-[0.1em] transition-colors duration-300 ${
                  heroUrl
                    ? "border-background/50 text-background hover:bg-background/10"
                    : "border-line text-ink hover:bg-sand"
                }`}
              >
                View our work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Introduction ─── */}
      <section className={sectionPadding.base}>
        <div className={container.wide}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
            <p className="label-uppercase lg:col-span-3 lg:pt-4">The practice</p>
            <div className="lg:col-span-9">
              <Reveal>
                <p className="font-serif font-light text-3xl md:text-4xl lg:text-5xl leading-[1.15] text-ink max-w-3xl">
                  {content.introHeading}
                </p>
                <p className="text-body mt-10 max-w-xl">
                  {content.introBody}
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
