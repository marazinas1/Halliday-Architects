import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/hooks/use-mobile";
import { container, sectionPadding } from "@/lib/rhythm";
import { SERVICES } from "@/content/firm";

/**
 * Services come from src/content/firm.ts (placeholder copy awaiting the
 * client's own words). This file only supplies presentation.
 */
export const services = SERVICES;

const MobileCarousel = ({ children, itemCount }: { children: React.ReactNode[]; itemCount: number }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", dragFree: false });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap() % itemCount);
  }, [emblaApi, itemCount]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {children.map((child, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-[85%] pl-4">
              {child}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: itemCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === selected ? "bg-ink w-6" : "bg-border hover:bg-stone"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const ServiceCard = ({ s, index }: { s: (typeof services)[0]; index: number }) => (
  <div className="h-full border-t border-line pt-8">
    <span className="numeral block text-5xl md:text-6xl lg:text-7xl mb-6">
      {String(index + 1).padStart(2, "0")}
    </span>
    <h3 className="heading-card text-ink text-lg mb-3">{s.title}</h3>
    <p className="text-body text-sm leading-relaxed">{s.description}</p>
  </div>
);

export const ServicesGrid = () => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Reveal>
        <MobileCarousel itemCount={services.length}>
          {services.map((s, i) => (
            <ServiceCard key={s.title} s={s} index={i} />
          ))}
        </MobileCarousel>
      </Reveal>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {services.map((s, i) => (
        <Reveal key={s.title}>
          <ServiceCard s={s} index={i} />
        </Reveal>
      ))}
    </div>
  );
};

const ServicesSection = ({ heading = "Services" }: { heading?: string }) => (
  <section className={`${sectionPadding.base} section-sand`}>
    <div className={container.wide}>
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
          <p className="label-uppercase lg:col-span-3 lg:pt-4">What We Do</p>
          <div className="lg:col-span-9">
            <h2 className="heading-display text-ink mb-6">{heading}</h2>
            {/* PLACEHOLDER COPY — awaiting the client's own words. */}
            <p className="text-body max-w-xl">
              An architecture practice in Ocean City, New Jersey, working on residential projects
              along the shore.
            </p>
          </div>
        </div>
      </Reveal>
      <ServicesGrid />
    </div>
  </section>
);

export default ServicesSection;
