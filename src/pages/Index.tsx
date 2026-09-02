import ResponsiveImage from "@/components/ResponsiveImage";
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
import { usePageContent } from "@/hooks/usePageContent";
import { readPreview } from "@/lib/admin/preview";
import { useResolvedPageImages, type ResolvedPhoto } from "@/hooks/useResolvedPageImages";

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
  objectPosition = "center",
  sizes = "100vw",
  quality = 80,
  maxWidth,
}: {
  photo: ResolvedPhoto | undefined;
  dark?: boolean;
  priority?: boolean;
  zoomOnHover?: boolean;
  objectPosition?: string;
  /** Real rendered width of this slot, so the browser picks the right variant. */
  sizes?: string;
  quality?: number;
  /** Largest variant this slot can ever use — small tiles never fetch a master. */
  maxWidth?: number;
}) => (
  <div className="absolute inset-0 overflow-hidden bg-sand">
    {photo?.url ? (
      <ResponsiveImage
        src={photo.url}
        alt={photo.alt}
        width={2000}
        height={1400}
        priority={priority}
        // The opening hero is the one image worth extra bytes; the rest of the
        // page is capped so the first paint stays fast.
        quality={quality}
        maxWidth={maxWidth}
        blurUp
        sizes={sizes}
        style={{ objectPosition }}
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
  const previewRow = isPreview ? readPreview<Partial<SiteSettingsRow>>("homepage") : null;
  const content = isPreview ? resolveHomepage(previewRow) : settings.homepage;
  const page = usePageContent();
  const { resolve } = useResolvedPageImages();

  const wall = ["wall_1", "wall_2", "wall_3", "wall_4", "wall_5", "wall_6"].map((slot) =>
    resolve("home", slot),
  );
  const tilePhotos = ["tile_projects", "tile_about", "tile_contact"].map((slot) =>
    resolve("home", slot),
  );
  const statement = page.copy("home", "intro_heading", content.introHeading || MANIFESTO_FALLBACK);
  const tiles = [
    { label: page.copy("home", "tile_projects_label", "Projects"), to: "/projects" },
    { label: page.copy("home", "tile_about_label", "About"), to: "/about" },
    { label: page.copy("home", "tile_contact_label", "Contact"), to: "/contact" },
  ];

  // Queue the opening photograph at the highest priority as soon as its URL is
  // known, instead of waiting for React to paint the <img>.
  const heroUrl = wall[0]?.url ?? null;
  useEffect(() => {
    if (!heroUrl) return;
    const srcSet = buildSrcSet(heroUrl, 85);
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.setAttribute("fetchpriority", "high");
    if (srcSet) {
      link.setAttribute("imagesrcset", srcSet);
      link.setAttribute("imagesizes", "100vw");
    } else {
      link.href = heroUrl;
    }
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [heroUrl]);




  return (
    <main className="min-h-screen bg-background">
      {isPreview && <PreviewBanner label="homepage" />}
      <GlobalNav overlayPhotoWall />
      <SEO
        title="Halliday Architects | Residential Architecture in Ocean City, NJ"
        description="Halliday Architects is a residential architecture practice in Ocean City, New Jersey."
        path="/"
        image={wall[0]?.url ?? undefined}
      />

      {/* Rich gallery wall: one opening image, then three, then two. */}
      <section id="home-photo-wall" className="flex flex-col gap-[2px]" aria-label="Selected residential architecture">
        <div className="relative h-[82svh] min-h-[560px] overflow-hidden">
          <PhotoFrame photo={wall[0]} priority sizes="100vw" quality={85} />
          <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 text-paper">
            <span aria-hidden="true" className="h-10 w-px bg-paper/50" />
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-paper/75">Scroll</span>
          </div>
        </div>

        {/* A third of the width each — never worth more than a 1400px master. */}
        <div className="grid gap-[2px] md:h-[44vh] md:min-h-[300px] md:grid-cols-3">
          {wall.slice(1, 4).map((photo, index) => (
            <div key={`wall-row-one-${index}`} className="relative h-[32vh] md:h-full">
              <PhotoFrame
                photo={photo}
                sizes="(min-width: 768px) 34vw, 100vw"
                quality={78}
                maxWidth={1400}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-[2px] md:h-[60vh] md:min-h-[400px] md:grid-cols-[1.4fr_1fr]">
          {wall.slice(4, 6).map((photo, index) => (
            <div key={`wall-row-two-${index}`} className="relative h-[40vh] md:h-full">
              <PhotoFrame
                photo={photo}
                sizes={index === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 100vw"}
                quality={80}
                maxWidth={2000}
              />
            </div>
          ))}
        </div>
      </section>



      <Reveal>
        <section className="px-6 py-24 text-center md:py-32">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-stone">The practice</p>
          <h1 className="mx-auto mt-6 max-w-[34ch] text-[clamp(1.4rem,3vw,2.1rem)] font-light leading-[1.4] text-ink">
            {statement}
          </h1>
        </section>
      </Reveal>

      <section className="grid gap-[2px] md:grid-cols-3" aria-label="Explore Halliday Architects">
        {tiles.map((tile, index) => (
          <Reveal key={tile.to} delay={index * 150}>
            <Link to={tile.to} className="group relative block aspect-[3/4] overflow-hidden">
              <PhotoFrame
                photo={tilePhotos[index]}
                zoomOnHover
                sizes="(min-width: 768px) 34vw, 100vw"
                quality={75}
                maxWidth={960}
              />

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

