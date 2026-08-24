import { useEffect, useRef, useState } from "react";
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

  // Parallax: the photograph drifts slower than the page, as on StageHomy.
  // rAF-throttled, and skipped entirely for reduced-motion users.
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!heroUrl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (imageRef.current) imageRef.current.style.transform = "scale(1)";
      return;
    }
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = imageRef.current;
        if (!el) return;
        const y = Math.min(window.scrollY, window.innerHeight);
        el.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(1.03)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [heroUrl]);

  return (
    <main className="min-h-screen bg-background">
      {isPreview && <PreviewBanner label="homepage" />}
      {/* The split hero is a light surface (white copy panel left, photograph
          right), so the nav always uses its dark-on-light treatment here. */}
      <GlobalNav lightHero />
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/"
      />

      {/* Hero — split layout: copy on a white panel left, the photograph in
          the right column. On mobile the photograph stacks above the copy.
          The image still comes from site_settings (/admin/homepage); a failed
          or missing image leaves a plain sand panel, never a broken frame. */}
      <section className="grid grid-cols-1 bg-background lg:grid-cols-[0.9fr_1.1fr] lg:min-h-[calc(100svh-5rem)]">
        {/* Photograph — right column on desktop, stacked first on mobile. */}
        <div className="relative order-first h-[320px] overflow-hidden bg-sand sm:h-[400px] lg:order-last lg:h-auto">
          {heroUrl && (
            <img
              ref={imageRef}
              src={heroUrl}
              alt=""
              aria-hidden="true"
              onError={() => setHeroFailed(true)}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ transform: "scale(1.03)" }}
            />
          )}
        </div>

        {/* Copy — white panel, vertically centered, left-aligned. */}
        <div className="flex items-center">
          <div className="w-full px-6 py-14 sm:px-10 lg:py-24 lg:pl-16 lg:pr-12 xl:pl-20 animate-fade-in-up">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand">
              Best of Houzz · Service · 2016 – 2024
            </span>
            <h1 className="heading-display whitespace-pre-line mt-6 max-w-[13ch] text-ink">
              {content.heroHeadline}
            </h1>
            <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-stone">
              {content.heroSubline}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                to="/contact"
                className="group inline-flex w-full items-center justify-center gap-2 h-12 px-8 bg-ink text-paper text-sm font-medium uppercase tracking-[0.1em] transition-all duration-300 hover:opacity-90 sm:w-auto"
              >
                Start a project
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex w-full items-center justify-center h-12 px-8 border border-line text-ink text-sm font-medium uppercase tracking-[0.1em] transition-colors duration-300 hover:bg-sand sm:w-auto"
              >
                View our work
              </Link>
            </div>

            {/* Statistics — a quiet strip under the buttons, separated by a
                hairline. Figures from src/content/firm.ts (STATS). */}
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-line pt-8">
              {STATS.map((s) => (
                <div key={s.label} className="min-w-[86px]">
                  <span className="block text-2xl font-extrabold leading-none text-ink md:text-3xl">
                    {s.figure}
                  </span>
                  <span className="mt-2 block text-[11px] font-medium uppercase tracking-wide text-ink">
                    {s.label}
                  </span>
                  <span className="block text-[11px] text-stone">
                    {s.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accreditations — one quiet line below the hero. */}
      <div className="border-b border-line">
        <div className={`${container.wide} py-4`}>
          <p className="text-xs uppercase tracking-widest text-stone">
            {ACCREDITATIONS}
          </p>
        </div>
      </div>

      {/* ─── Introduction — centered editorial statement ─── */}
      <section className={sectionPadding.base}>
        <div className={container.content}>
          <Reveal>
            <div className="text-center">
              <p className="label-uppercase">The practice</p>
              <p className="statement text-ink max-w-3xl mx-auto mt-8">
                {content.introHeading}
              </p>
              <p className="text-body mt-10 max-w-2xl mx-auto">
                {content.introBody}
              </p>
              <Link
                to="/about"
                className="mt-10 inline-block label-uppercase text-ink link-underline"
              >
                About the practice
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SelectedWork />

      <ServicesPreview />

      <ProcessSection />

      <Testimonials />

      {/* ─── The studio — the principals themselves ─── */}
      <section className={sectionPadding.base}>
        <div className={container.wide}>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-14 lg:mb-20">
              <div>
                <p className="label-uppercase mb-6">The studio</p>
                <p className="statement text-ink max-w-2xl">
                  Led personally by both principals.
                </p>
              </div>
              <Link
                to="/team"
                className="label-uppercase text-ink link-underline"
              >
                Meet the studio
              </Link>
            </div>
          </Reveal>
          <PrincipalsGrid centered={false} portrait />
        </div>
      </section>

      <AreasServed />

      {/* ─── Practice statement — placeholder, awaiting the client's own words ─── */}
      <section className={`${sectionPadding.loose} bg-ink`}>
        <div className={container.content}>
          <Reveal>
            <p className="statement text-paper max-w-3xl mx-auto text-center">
              Every project begins with the site — its light, its exposure, and the way a family
              intends to live in the house.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Closing call to action ─── */}
      <CTASection
        variant="light"
        eyebrow="Get in touch"
        heading="Start a project with us"
        description="Tell us about your site and what you have in mind, or call the studio on 609.957.6789. Every enquiry is answered personally."
      />

      <GlobalFooter />
    </main>
  );
};

export default Index;
