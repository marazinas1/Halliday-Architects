import { Link } from "react-router-dom";
import { ArrowRight, Menu } from "lucide-react";
import SEO from "@/components/SEO";
import { FIRM } from "@/content/firm";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import BrandLogo from "@/components/BrandLogo";
import { buildConceptPhotos, pickPhotos, type ConceptPhoto } from "@/lib/conceptPhotos";

/*
 * Home V2 — an alternative homepage concept shown to the client alongside the
 * current one at "/". Deliberately self-contained: its own nav, wall, tiles and
 * footer, so nothing here can affect the live homepage. To retire this concept,
 * delete this file and its route in src/App.tsx.
 */

const NAV = [
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Team", to: "/team" },
  { label: "Contact", to: "/contact" },
];

const MANIFESTO_FALLBACK =
  "Houses designed for the shore they stand on — the local vernacular, new building technology, and the way a family lives.";

/** Neutral panel used whenever a slot has no photograph behind it. */
const Placeholder = ({ dark = false }: { dark?: boolean }) => (
  <div
    aria-hidden
    className="absolute inset-0"
    style={{
      background: dark
        ? "linear-gradient(155deg,#2a2c2e 0%,#3c3e3f 50%,#26221c 100%)"
        : "linear-gradient(155deg,#cdd2d6 0%,#e6e7e5 45%,#c9c2b4 100%)",
    }}
  />
);

const Frame = ({
  photo,
  dark,
  priority,
}: {
  photo: ConceptPhoto | undefined;
  dark?: boolean;
  priority?: boolean;
}) => (
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
      <Placeholder dark={dark} />
    )}
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 90% at 30% 20%, transparent 40%, rgba(0,0,0,.22) 100%)",
      }}
    />
  </div>
);

const HomeV2 = () => {
  const { settings } = useSiteSettings();
  const { data: projects = [] } = usePublicProjects();

  const hero = settings.homepage.heroImageUrl;
  const photos = buildConceptPhotos(projects, hero, FIRM.name);

  const wall = pickPhotos(photos, [0, 1, 2, 3]);
  const tilePhotos = pickPhotos(photos, [4, 5, 6]);

  const tiles = [
    { label: "Projects", to: "/projects" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/home-v2"
        image={hero ?? undefined}
      />

      <div className="relative">
        {/* Nav — transparent, sitting over the first photograph. */}
        <nav className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 lg:px-8">
            <Link to="/home-v2" className="flex items-center" aria-label={`${FIRM.name} — Home`}>
              <BrandLogo variant="dark" className="h-9 w-auto md:h-11" />
            </Link>
            <div className="hidden gap-8 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[0.7rem] uppercase tracking-[0.14em] text-white/90 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link to="/contact" className="md:hidden text-white" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Link>
          </div>
        </nav>

        {/* Photo wall */}
        <div className="flex flex-col gap-[2px]">
          <div className="relative h-[78vh] min-h-[520px]">
            <Frame photo={wall[0]} priority />
          </div>
          <div className="grid gap-[2px] md:grid-cols-[1.4fr_1fr]">
            <div className="relative h-[50vh] min-h-[320px] md:h-[60vh] md:min-h-[400px]">
              <Frame photo={wall[1]} />
            </div>
            <div className="relative h-[50vh] min-h-[320px] md:h-[60vh] md:min-h-[400px]">
              <Frame photo={wall[2]} />
            </div>
          </div>
          <div className="relative h-[78vh] min-h-[520px]">
            <Frame photo={wall[3]} dark />
          </div>
        </div>
      </div>

      {/* Manifesto */}
      <section className="px-6 py-24 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-stone">The practice</p>
        <h2 className="mx-auto mt-6 max-w-[34ch] text-[clamp(1.4rem,3vw,2.1rem)] font-light leading-[1.4] text-ink">
          {settings.homepage.introHeading || MANIFESTO_FALLBACK}
        </h2>
      </section>

      {/* Tiles */}
      <div className="grid gap-[2px] md:grid-cols-3">
        {tiles.map((tile, i) => (
          <Link key={tile.to} to={tile.to} className="group relative aspect-[3/4] overflow-hidden">
            <Frame photo={tilePhotos[i]} />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(10,10,10,.75), transparent 55%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-7 text-white">
              <b className="text-[0.95rem] font-medium tracking-[0.04em]">{tile.label}</b>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

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

export default HomeV2;
