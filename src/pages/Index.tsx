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
import { CREDENTIALS } from "@/content/firm";
import Testimonials from "@/components/sections/Testimonials";

/*
 * Hero and introduction copy come from site_settings, edited at /admin/homepage.
 * Every field falls back to HOMEPAGE_FALLBACKS when empty, so the page never
 * renders blank.
 */

/*
 * Credentials shown in the band below the hero come from src/content/firm.ts —
 * only claims that remain publicly verifiable (AIA, LEED, NCARB, licensure).
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
      {/* With photography behind it the nav switches to its light-on-dark
          treatment and the fixed scrim above keeps the mark legible whatever
          image the admin sets. */}
      <GlobalNav lightHero={!heroUrl} />
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/"
      />

      {/* Hero — full viewport, photography when set, otherwise a plain sand block. */}
      <section
        className={`relative flex min-h-screen min-h-[100svh] flex-col overflow-hidden ${heroUrl ? "bg-ink" : "bg-sand"}`}
      >
        {heroUrl && (
          <>
            <img
              ref={imageRef}
              src={heroUrl}
              alt=""
              aria-hidden="true"
              onError={() => setHeroFailed(true)}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ transform: "scale(1.03)" }}
            />
            {/*
              The photograph is a real house, so the lightest scrim that keeps
              the copy legible and no more. The top scrim is owned by GlobalNav
              (it lives with the nav it protects and works on every page); here
              only the bottom gradient behind the copy is kept, the middle of the
              frame left untouched.
            */}
            <div
              className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-ink/75 via-ink/30 to-transparent"
              aria-hidden="true"
            />
          </>
        )}

        <div
          className={`relative flex flex-1 items-end ${container.wide} pt-28 pb-8 md:pt-32 md:pb-16`}
        >
          <div className="max-w-3xl animate-fade-in-up">
            <span
              className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest ${
                heroUrl
                  ? "border-background/40 bg-background/10 text-background/90 backdrop-blur-sm"
                  : "border-line bg-paper text-stone"
              }`}
            >
              Residential architecture · Ocean City, NJ
            </span>
            <h1 className={`heading-display mt-8 ${heroUrl ? "text-background" : "text-ink"}`}>
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

      {/* Credentials — a quiet footnote on the solid page surface, not a
          second headline competing with the photograph. */}
      <div className="border-b border-line">
        <div className={`${container.wide} py-5`}>
          <ul className="flex flex-col gap-3 text-xs leading-relaxed sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
            {CREDENTIALS.map((c, i) => (
              <li key={c.label} className="flex items-center gap-x-6">
                {i > 0 && (
                  <span aria-hidden="true" className="hidden h-3 w-px bg-line sm:block" />
                )}
                <span>
                  <span className="uppercase tracking-widest text-stone">{c.label}</span>
                  <span aria-hidden="true" className="px-2 opacity-50">·</span>
                  <span className="text-ink">{c.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Introduction ─── */}
      <section className={sectionPadding.base}>
        <div className={container.wide}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
            <p className="label-uppercase lg:col-span-3 lg:pt-4">The practice</p>
            <div className="lg:col-span-9">
              <Reveal>
                <p className="statement text-ink max-w-3xl">
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

      <SelectedWork />

      <ServicesPreview />

      <AreasServed />

      <Testimonials />

      {/* ─── The studio — the principals themselves ─── */}
      <section className={sectionPadding.base}>
        <div className={container.wide}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
            <p className="label-uppercase lg:col-span-3 lg:pt-4">The studio</p>
            <div className="lg:col-span-9">
              <Reveal>
                <p className="statement text-ink max-w-3xl">
                  Led personally by both principals.
                </p>
                <div className="mt-10">
                  <PrincipalsGrid centered={false} />
                </div>
                <Link
                  to="/team"
                  className="mt-10 inline-block label-uppercase text-ink link-underline"
                >
                  Meet the studio
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Practice statement — placeholder, awaiting the client's own words ─── */}
      <section className={`${sectionPadding.loose} bg-ink`}>
        <div className={container.content}>
          <Reveal>
            <p className="statement text-paper max-w-3xl">
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
