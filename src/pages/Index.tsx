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
import ProcessSection from "@/components/sections/ProcessSection";
import { PrincipalsGrid } from "@/components/sections/TeamSection";
import AreasServed from "@/components/sections/AreasServed";
import PreviewBanner from "@/components/admin/PreviewBanner";
import { container, sectionPadding } from "@/lib/rhythm";
import {
  resolveHomepage,
  useSiteSettings,
  type SiteSettingsRow,
} from "@/hooks/useSiteSettings";
import { readPreview } from "@/lib/admin/preview";
import { STATS, ACCREDITATIONS } from "@/content/firm";
import Testimonials from "@/components/sections/Testimonials";

/*
 * Hero and introduction copy come from site_settings, edited at /admin/homepage.
 * Every field falls back to HOMEPAGE_FALLBACKS when empty, so the page never
 * renders blank.
 */

/*
 * Statistics and accreditations come from src/content/firm.ts — only claims
 * that remain publicly verifiable (Houzz figures, AIA, LEED, NCARB, licensure).
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
      <GlobalNav />
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/"
        image={content.heroImageUrl ?? undefined}
      />

      {/* Hero — split layout: copy on a white panel left, the photograph in
          the right column. On mobile the photograph stacks above the copy.
          The image still comes from site_settings (/admin/homepage); a failed
          or missing image leaves a plain sand panel, never a broken frame. */}
      <section className="grid grid-cols-1 bg-background lg:grid-cols-[0.9fr_1.1fr]">
        {/* Photograph — right column on desktop, stacked first on mobile. */}
        <div className="relative order-first h-[320px] overflow-hidden bg-sand sm:h-[400px] lg:order-last lg:h-auto lg:min-h-[520px]">
          {heroUrl && (
            <img
              src={heroUrl}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              onError={() => setHeroFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        {/* Copy — white panel, vertically centered, left-aligned. */}
        <div className="flex items-center">
          <div className="w-full px-6 py-14 sm:px-10 lg:py-10 lg:pl-16 lg:pr-14 xl:py-12 xl:pl-20 animate-fade-in-up">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Best of Houzz · Service · 2016 – 2024
            </span>
            <h1 className="heading-display whitespace-pre-line mt-4 max-w-[17ch] text-[1.75rem] sm:text-[2rem] lg:text-[2.1rem] xl:text-[2.3rem] text-ink">
              {content.heroHeadline}
            </h1>
            <p className="text-body mt-4 max-w-[40ch]">{content.heroSubline}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                to="/contact"
                className="group inline-flex w-full items-center justify-center gap-2 h-12 px-8 bg-ink text-paper text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-90 sm:w-auto"
              >
                Start a project
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex w-full items-center justify-center h-12 px-8 border border-line text-ink text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-sand sm:w-auto"
              >
                View our work
              </Link>
            </div>

            {/* Statistics — a quiet strip under the buttons, separated by a
                hairline. Figures from src/content/firm.ts (STATS). */}
            <div className="mt-7 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-6">
              {STATS.map((s) => (
                <div key={s.label} className="min-w-[86px] text-center">
                  <span className="block text-xl font-bold leading-none text-ink lg:text-2xl">
                    {s.figure}
                  </span>
                  <span className="mt-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
                    {s.label}
                  </span>
                  <span className="block text-[11px] text-stone">{s.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accreditations — one quiet line below the hero. */}
      <div className="border-y border-line">
        <div className={`${container.wide} py-4`}>
          <p className="text-[11px] uppercase tracking-[0.16em] text-stone">{ACCREDITATIONS}</p>
        </div>
      </div>

      {/* ─── The practice — centered editorial statement ─── */}
      <section className={sectionPadding.base}>
        <div className={container.content}>
          <Reveal>
            <div className="text-center">
              <p className="label-uppercase">The practice</p>
              <p className="statement text-ink mt-6">{content.introHeading}</p>
              <p className="text-body mt-8 max-w-[44rem] mx-auto">{content.introBody}</p>
              <div className="below-link">
                <Link to="/about" className="link-inline">
                  About the practice
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SelectedWork />

      <ServicesPreview />

      {/* ─── Our approach — a clean solid ink band ─── */}
      <section className="bg-ink">
        <div className={sectionPadding.loose}>
          <div className={container.content}>
            <Reveal>
              <div className="text-center">
                <p className="label-uppercase text-paper/60">Our approach</p>
                <p className="statement text-paper mt-6">
                  Every project begins with the site — its light, its exposure, and the way a
                  family intends to live in the house.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ProcessSection />

      {/* ─── The studio — the principals themselves ─── */}
      <section className={sectionPadding.base}>
        <div className={container.people}>
          <Reveal>
            <div className="section-head">
              <span className="label-uppercase">The studio</span>
              <h2 className="heading-section text-ink">Led personally by both principals</h2>
            </div>
          </Reveal>
          <PrincipalsGrid portrait />
          <Reveal>
            <div className="below-link">
              <Link to="/team" className="link-inline">
                Meet the studio
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Testimonials />

      <AreasServed />


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

