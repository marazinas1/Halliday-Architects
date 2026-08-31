import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import SEO from "@/components/SEO";
import BrandLogo from "@/components/BrandLogo";
import { FIRM } from "@/content/firm";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { buildConceptPhotos, pickPhotos, type ConceptPhoto } from "@/lib/conceptPhotos";

/*
 * Home V3 — the second alternative homepage concept shown to the client
 * alongside "/" and "/home-v2". Self-contained on purpose: its own nav, layout
 * and footer, so nothing here can affect the live homepage. To retire this
 * concept, delete this file and its route in src/App.tsx.
 */

const NAV = [
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Team", to: "/team" },
  { label: "Contact", to: "/contact" },
];

const STATEMENT_FALLBACK =
  "We approach design as a response to the local vernacular, to new building technology, and to the way the spaces of a house work together.";

/** Neutral panel used whenever a slot has no photograph behind it. */
const Placeholder = () => (
  <div
    aria-hidden
    className="absolute inset-0"
    style={{ background: "linear-gradient(155deg,#cdd2d6 0%,#e6e7e5 45%,#c9c2b4 100%)" }}
  />
);

const Frame = ({ photo, priority }: { photo?: ConceptPhoto; priority?: boolean }) => (
  <div className="absolute inset-0 overflow-hidden bg-sand">
    {photo?.url ? (
      <img
        src={photo.url}
        alt={photo.alt}
        width={2000}
        height={1400}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        className="h-full w-full object-cover"
      />
    ) : (
      <Placeholder />
    )}
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: "radial-gradient(120% 90% at 30% 20%, transparent 40%, rgba(0,0,0,.14) 100%)",
      }}
    />
  </div>
);

const caption = (photo?: ConceptPhoto) =>
  photo?.title ? [photo.title, photo.location].filter(Boolean).join(" — ") : "";

const HomeV3 = () => {
  const { settings } = useSiteSettings();
  const { data: projects = [] } = usePublicProjects();

  const hero = settings.homepage.heroImageUrl;
  const pool = buildConceptPhotos(projects, hero, FIRM.name);
  const [heroPhoto, featured, left, right] = pickPhotos(pool, [0, 1, 2, 3]);

  const accreditations = "AIA member · LEED accredited · NCARB certified";

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/home-v3"
        image={hero ?? undefined}
      />

      {/* Nav */}
      <nav className="border-b border-line">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/home-v3" className="flex items-center" aria-label={`${FIRM.name} — Home`}>
            <BrandLogo variant="light" className="h-9 w-auto md:h-10" />
          </Link>
          <div className="hidden gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[0.7rem] uppercase tracking-[0.14em] text-stone transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link to="/contact" className="text-ink md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative h-[88vh] min-h-[560px]">
        <Frame photo={heroPhoto} priority />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,.62) 0%, transparent 38%)" }}
        />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-center text-white">
          <Link to="/home-v3" className="mb-6 inline-flex" aria-label={FIRM.name}>
            <BrandLogo variant="dark" className="h-12 w-auto md:h-14" />
          </Link>
          <b className="block text-[clamp(1.25rem,3vw,1.6rem)] font-semibold tracking-tight">
            Residential architecture in Ocean City, New Jersey
          </b>
          <span className="mt-2 block text-[0.9rem] text-white/80">
            Christopher and Shannon Halliday lead every project personally.
          </span>
        </div>
      </div>

      {/* Accreditations */}
      <div className="border-b border-line px-6 py-6 text-center">
        <span className="text-[0.66rem] uppercase tracking-[0.16em] text-stone">
          {accreditations}
        </span>
      </div>

      {/* Statement */}
      <section className="px-6 pb-16 pt-20 text-center">
        <p className="mb-5 text-[0.68rem] uppercase tracking-[0.18em] text-stone">The practice</p>
        <h2 className="mx-auto max-w-[36ch] text-[clamp(1.4rem,2.8vw,2rem)] font-light leading-[1.4] text-ink">
          {settings.homepage.introHeading || STATEMENT_FALLBACK}
        </h2>
      </section>

      {/* Selected work */}
      <section className="px-6 pb-20">
        <div className="mb-10 text-center">
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-stone">Portfolio</span>
          <h3 className="mt-2 text-2xl font-bold text-ink">Selected work</h3>
        </div>

        <Link
          to={featured?.href ?? "/projects"}
          className="relative mx-auto block aspect-[16/8] w-full max-w-[1440px]"
        >
          <Frame photo={featured} />
        </Link>
        <p className="mx-auto mb-10 mt-3 max-w-[1440px] text-center text-[0.78rem] text-stone">
          {caption(featured)}
        </p>

        <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-2">
          {[left, right].map((photo, i) => (
            <div key={i}>
              <Link to={photo?.href ?? "/projects"} className="relative block aspect-square">
                <Frame photo={photo} />
              </Link>
              <p className="mt-3 text-[0.78rem] text-stone">{caption(photo)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Close */}
      <section className="border-t border-line bg-sand px-6 py-16 text-center">
        <p className="text-[0.92rem] text-stone">Tell us about your site and what you have in mind.</p>
        <Link
          to="/contact"
          className="mt-4 inline-block border-b border-ink pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink"
        >
          Start a project →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-ink px-6 py-12 text-center text-white/55">
        <BrandLogo variant="dark" className="mx-auto mb-4 h-10 w-auto" />
        <p className="text-[0.78rem]">
          {FIRM.address1}, {FIRM.address2} ·{" "}
          <a href={FIRM.phoneHref} className="hover:text-white">
            {FIRM.phone}
          </a>
        </p>
      </footer>
    </main>
  );
};

export default HomeV3;
