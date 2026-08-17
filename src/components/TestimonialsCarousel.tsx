import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/content/hallidayLeonard";

const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
    setExpanded(null);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative max-w-3xl mx-auto">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full px-2">
              <div className="text-center px-4 md:px-12">
                <svg className="w-10 h-10 mx-auto mb-8 text-charcoal/20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.3 2.5c-1.4.7-2.5 1.6-3.4 2.7C6.9 6.3 6.3 7.5 5.9 8.9c-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2zm10 0c-1.4.7-2.5 1.6-3.4 2.7-1 1.1-1.6 2.3-2 3.7-.4 1.3-.5 2.8-.3 4.3h.1c.5-.5 1.2-.8 2-.8 1 0 1.9.4 2.6 1.1.7.7 1.1 1.6 1.1 2.7 0 1-.4 1.9-1.1 2.6-.7.7-1.6 1.1-2.7 1.1-1.2 0-2.2-.5-3-1.4-.8-1-1.2-2.2-1.2-3.8 0-2 .4-3.8 1.2-5.5.8-1.7 1.9-3.1 3.3-4.2 1.4-1.1 2.9-1.9 4.5-2.3l-.1-.2z" />
                </svg>
                <p className="text-xl md:text-2xl font-serif font-light italic text-charcoal leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                {t.full && (
                  <div className="mb-6">
                    {expanded === i ? (
                      <p className="text-body text-sm whitespace-pre-line text-left md:text-center">
                        {t.full}
                      </p>
                    ) : null}
                    <button
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="mt-4 text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal border-b border-charcoal/30 pb-1 transition-colors"
                    >
                      {expanded === i ? "Read less" : "Read more"}
                    </button>
                  </div>
                )}
                <div className="w-12 h-px bg-charcoal/30 mx-auto mb-4" />
                <p className="text-xs uppercase tracking-widest text-charcoal/60">{t.author}</p>
                <p className="text-xs text-muted-slate mt-1">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={scrollPrev}
          aria-label="Previous testimonial"
          className="w-10 h-10 flex items-center justify-center border border-border hover:border-charcoal transition-colors"
          style={{ borderRadius: "4px" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === selected ? "bg-charcoal w-6" : "bg-border hover:bg-muted-slate"}`}
            />
          ))}
        </div>
        <button
          onClick={scrollNext}
          aria-label="Next testimonial"
          className="w-10 h-10 flex items-center justify-center border border-border hover:border-charcoal transition-colors"
          style={{ borderRadius: "4px" }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
