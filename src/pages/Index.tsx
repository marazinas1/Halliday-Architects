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
import AreasServed from "@/components/sections/AreasServed";
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

/*
 * Credentials shown in the hero band.
 * Source: the practice's Houzz profile — Best of Houzz awards 2016-2022 and the
 * 5.0 review rating across 43 reviews; RA / LEED AP from the principals' own
 * credentials. Publicly verifiable; nothing here is estimated or invented.
 */
const CREDENTIALS = [
  { label: "Best of Houzz", value: "Winner, 2016 – 2022" },
  { label: "Client reviews", value: "5.0 across 43 reviews on Houzz" },
  { label: "Licensed practice", value: "Registered architects, RA and LEED AP" },
];

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

      {/* Hero — full viewport, photography when set, otherwise a plain sand block. */}
      <section
        className={`relative flex min-h-screen min-h-[100svh] flex-col ${heroUrl ? "bg-ink" : "bg-sand"}`}
      >
        {heroUrl && (
          <>
            <img
              src={heroUrl}
              alt=""
              aria-hidden="true"
              onError={() => setHeroFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/*
              The photograph is a real house, so the lightest scrim that keeps the
              headline legible and no more: a soft wash under the nav and a gentle
              gradient behind the copy. The middle of the frame stays untouched.
            */}
            <div
              className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/45 to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-ink/75 via-ink/35 to-transparent"
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

        {/* Credentials — recognition rather than volume, so given room and set quietly. */}
        <div
          className={`relative ${
            heroUrl
              ? "border-t border-background/15 bg-ink/25 backdrop-blur-md"
              : "border-t border-line bg-paper/70"
          }`}
        >
          <div className={container.wide}>
            <div
              className={`grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0 ${
                heroUrl ? "divide-background/15" : "divide-line"
              }`}
            >
              {CREDENTIALS.map((c) => (
                <div
                  key={c.label}
                  className="py-4 md:py-8 md:px-8 md:first:pl-0 md:last:pr-0"
                >
                  <p
                    className={`text-[11px] font-medium uppercase tracking-widest ${
                      heroUrl ? "text-background/60" : "text-stone"
                    }`}
                  >
                    {c.label}
                  </p>
                  <p
                    className={`mt-2 text-sm leading-relaxed md:mt-3 md:text-base ${
                      heroUrl ? "text-background" : "text-ink"
                    }`}
                  >
                    {c.value}
                  </p>
                </div>
              ))}
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

      <SelectedWork />

      <ServicesPreview />

      <AreasServed />

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
