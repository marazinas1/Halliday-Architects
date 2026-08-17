import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/hooks/use-mobile";

export const services = [
  {
    title: "Custom Homes",
    description:
      "Bespoke residences built on your lot — from primary residences to vacation retreats — designed and executed with four decades of craftsmanship.",
    icon: (
      <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    title: "Developments",
    description:
      "Multi-home and multi-family developments delivered on time and on budget, with a steady hand from acquisition through final inspection.",
    icon: (
      <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V9l6-4 6 4v12M9 21V13h6v8M15 21V11l6 4v6" />
      </svg>
    ),
  },
  {
    title: "Joint Ventures",
    description:
      "Trusted partnerships with landowners, investors, and architects to bring ambitious coastal projects to life — from concept through completion.",
    icon: (
      <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m8-12a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Renovations",
    description:
      "Thoughtful renovations and additions that respect the character of your home while elevating its quality, comfort, and long-term value.",
    icon: (
      <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 18l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
];

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
              i === selected ? "bg-charcoal w-6" : "bg-border hover:bg-muted-slate"
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
    <h3 className="heading-card text-charcoal mb-4">{s.title}</h3>
    <div className="w-8 h-px bg-charcoal/30 mx-auto mb-4" />
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
  <section className="section-padding section-sand">
    <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
      <Reveal>
        <div className="text-center mb-16">
          <p className="label-uppercase mb-4">What We Do</p>
          <h2 className="heading-section text-charcoal mb-6">{heading}</h2>
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
