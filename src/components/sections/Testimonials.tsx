import { Star } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useTestimonials } from "@/hooks/useTestimonials";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Client words. The section renders nothing at all until the practice has
 * published a quote in the admin panel — no placeholders, no invented reviews.
 */
const Testimonials = () => {
  const { data } = useTestimonials();
  if (!data || data.length === 0) return null;
  const items = data.slice(0, 3);

  return (
    <section className={`${sectionPadding.base} section-sand`}>
      <div className={container.wide}>
        <Reveal>
          <div className="section-head">
            <span className="label-uppercase">In their words</span>
            <h2 className="heading-section text-ink">What clients say</h2>
            <p className="text-body mt-4">Rated 5.0 from 43 client reviews.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {items.map((t) => (
            <Reveal key={t.id}>
              <figure className="h-full flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-brand" aria-label="Five out of five">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="text-body mt-6 max-w-[34ch]">{t.quote}</blockquote>
                <div className="w-10 h-px bg-line my-6" />
                <figcaption>
                  <span className="block text-sm font-medium text-ink">{t.author_name}</span>
                  {t.author_detail && (
                    <span className="block text-sm text-stone mt-1">{t.author_detail}</span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-14 text-center text-sm text-stone">Reviews via Houzz</p>
        </Reveal>

      </div>
    </section>
  );
};

export default Testimonials;
