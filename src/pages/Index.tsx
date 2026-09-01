import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PreviewBanner from "@/components/admin/PreviewBanner";
import Reveal from "@/components/Reveal";
import {
  resolveHomepage,
  useSiteSettings,
  type SiteSettingsRow,
} from "@/hooks/useSiteSettings";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { readPreview } from "@/lib/admin/preview";
import { FIRM } from "@/content/firm";
import {
  arrangeConceptPhotos,
  buildConceptPhotos,
  pickPhotos,
  type ConceptPhoto,
} from "@/lib/conceptPhotos";

const MANIFESTO_FALLBACK =
  "Houses designed for the shore they stand on — the local vernacular, new building technology, and the way a family lives.";

const Placeholder = ({ dark = false }: { dark?: boolean }) => (
  <div
    aria-hidden="true"
    className="absolute inset-0"
    style={{
      background: dark
        ? "linear-gradient(155deg,#2a2c2e 0%,#3c3e3f 50%,#26221c 100%)"
        : "linear-gradient(155deg,#cdd2d6 0%,#e6e7e5 45%,#c9c2b4 100%)",
    }}
  />
);

const PhotoFrame = ({
  photo,
  dark = false,
  priority = false,
  zoomOnHover = false,
}: {
  photo: ConceptPhoto | undefined;
  dark?: boolean;
  priority?: boolean;
  zoomOnHover?: boolean;
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
        className={`h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out ${zoomOnHover ? "group-hover:scale-[1.04]" : ""}`}
      />
    ) : (
      <Placeholder dark={dark} />
    )}
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ background: "radial-gradient(120% 90% at 30% 20%, transparent 40%, rgba(0,0,0,.22) 100%)" }}
    />
  </div>
);

const Index = () => {
  const { pathname } = useLocation();
  const isPreview = pathname === "/admin/preview/homepage";
  const { settings } = useSiteSettings();
  const { data: projects = [] } = usePublicProjects();
  const previewRow = isPreview ? readPreview<Partial<SiteSettingsRow>>("homepage") : null;
  const content = isPreview ? resolveHomepage(previewRow) : settings.homepage;

  const projectPhotos = arrangeConceptPhotos(buildConceptPhotos(projects, null, FIRM.name), [
    "262-bayshore-road",
    "11605-paradise-drive",
    "19-flamingo-road",
    "111-anchor-rd",
    "115-anchor-road",
  ]);
  const photos = content.heroImageUrl
    ? [{ url: content.heroImageUrl, alt: `${FIRM.name} — residential architecture` }, ...projectPhotos]
    : projectPhotos;
  const wall = pickPhotos(photos, [0, 1, 2, 3]);
  const tilePhotos = pickPhotos(photos, [4, 5, 6]);
  const tiles = [
    { label: "Projects", to: "/projects" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <main className="min-h-screen bg-background">
      {isPreview && <PreviewBanner label="homepage" />}
      <GlobalNav overlayPhotoWall />
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/"
        image={content.heroImageUrl ?? undefined}
      />

      {/* An edge-to-edge photo wall with no overlaid headline or controls. */}
      <section id="home-photo-wall" className="flex flex-col gap-[2px]" aria-label="Selected residential architecture">
        <Reveal>
          <div className="relative h-[78svh] min-h-[520px]">
            <PhotoFrame photo={wall[0]} priority />
          </div>
        </Reveal>
        <div className="grid gap-[2px] md:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="relative h-[50vh] min-h-[320px] md:h-[60vh] md:min-h-[400px]">
              <PhotoFrame photo={wall[1]} />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative h-[50vh] min-h-[320px] md:h-[60vh] md:min-h-[400px]">
              <PhotoFrame photo={wall[2]} />
            </div>
          </Reveal>
        </div>
        <Reveal>
          <div className="relative h-[78vh] min-h-[520px]">
            <PhotoFrame photo={wall[3]} dark />
          </div>
        </Reveal>
      </section>

      <Reveal>
        <section className="px-6 py-24 text-center md:py-32">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-stone">The practice</p>
          <h1 className="mx-auto mt-6 max-w-[34ch] text-[clamp(1.4rem,3vw,2.1rem)] font-light leading-[1.4] text-ink">
            {content.introHeading || MANIFESTO_FALLBACK}
          </h1>
        </section>
      </Reveal>

      <section className="grid gap-[2px] md:grid-cols-3" aria-label="Explore Halliday Architects">
        {tiles.map((tile, index) => (
          <Reveal key={tile.to} delay={index * 120}>
            <Link to={tile.to} className="group relative block aspect-[3/4] overflow-hidden">
              <PhotoFrame photo={tilePhotos[index]} zoomOnHover />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-7 text-paper">
                <span className="text-[0.95rem] font-medium tracking-[0.04em]">{tile.label}</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </Reveal>
        ))}
      </section>


      <GlobalFooter />
    </main>
  );
};

export default Index;

