import { useEffect, useState } from "react";
import subpageHero from "@/assets/subpage-hero.jpg";

/** Shared internal-page hero: parallax architectural image with dark overlay. */
const PageHero = ({
  eyebrow,
  title,
  image = subpageHero,
}: {
  eyebrow: string;
  title: string;
  image?: string;
}) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-[55vh] min-h-[360px] flex items-center justify-center overflow-hidden">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <p className="label-uppercase text-white/70 mb-4">{eyebrow}</p>
        <h1 className="heading-display text-white">{title}</h1>
      </div>
    </section>
  );
};

export default PageHero;
