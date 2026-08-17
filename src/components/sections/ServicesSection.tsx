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

const ServiceCard = ({ s }: { s: (typeof services)[0] }) => (
  <div className="card-elegant p-8 h-full text-center">
    <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">{s.icon}</div>
    <h3 className="heading-card text-ink mb-4">{s.title}</h3>
    <div className="w-8 h-px bg-ink/30 mx-auto mb-4" />
    <p className="text-body text-sm leading-relaxed">{s.description}</p>
  </div>
);

export const ServicesGrid = () => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Reveal>
        <MobileCarousel itemCount={services.length}>
          {services.map((s) => (
            <ServiceCard key={s.title} s={s} />
          ))}
        </MobileCarousel>
      </Reveal>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {services.map((s) => (
        <Reveal key={s.title}>
          <ServiceCard s={s} />
        </Reveal>
      ))}
    </div>
  );
};

const ServicesSection = ({ heading = "Services" }: { heading?: string }) => (
  <section className={`${sectionPadding.base} section-sand`}>
    <div className={container.wide}>
      <Reveal>
        <div className="text-center mb-16">
          <p className="label-uppercase mb-4">What We Do</p>
          <h2 className="heading-section text-ink mb-6">{heading}</h2>
          <div className="divider mx-auto mb-6" />
          <p className="text-body max-w-2xl mx-auto">
            Whether you're building your dream home on your own lot, developing a multi-home project,
            or partnering with us on a joint venture — we bring the same craftsmanship to every build.
          </p>
        </div>
      </Reveal>
      <ServicesGrid />
    </div>
  </section>
);

export default ServicesSection;
