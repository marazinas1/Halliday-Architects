import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/hooks/use-mobile";
import { container, sectionPadding } from "@/lib/rhythm";
import { COASTAL_NOTE, SERVICES } from "@/content/firm";

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
    <p className="text-body text-sm leading-relaxed mt-3 text-stone">{s.detail}</p>
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {services.map((s, i) => (
        <Reveal key={s.title}>
          <ServiceCard s={s} index={i} />
        </Reveal>
      ))}
    </div>
  );
};

const ServicesSection = ({
  heading = "Services",
  withHeading = true,
}: {
  heading?: string;
  withHeading?: boolean;
}) => (
  <section className={`${sectionPadding.base} section-sand`}>
    <div className={container.wide}>
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
          {withHeading && <p className="label-uppercase lg:col-span-3 lg:pt-4">What We Do</p>}
          <div className={withHeading ? "lg:col-span-9" : "lg:col-span-9 lg:col-start-4"}>
            {withHeading && <h2 className="heading-display text-ink mb-6">{heading}</h2>}
            <p className="text-body max-w-xl">
              A residential architecture practice in Ocean City, New Jersey. We take a house from
              the first conversation about a site through to the questions that come up during
              construction — design, approvals and everything in between.
            </p>
          </div>
        </div>
      </Reveal>
      <ServicesGrid />

      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mt-16 lg:mt-24">
          <p className="label-uppercase lg:col-span-3 lg:pt-1">Building on the shore</p>
          <p className="text-body lg:col-span-9 max-w-2xl">{COASTAL_NOTE}</p>
        </div>
      </Reveal>
    </div>
  </section>
);

export default ServicesSection;
