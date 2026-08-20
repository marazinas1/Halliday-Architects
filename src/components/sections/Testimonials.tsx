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

  return (
    <section className={`${sectionPadding.base} section-sand`}>
      <div className={container.wide}>
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
            <p className="label-uppercase lg:col-span-3 lg:pt-3">In their words</p>
            <h2 className="heading-section text-ink lg:col-span-9 max-w-2xl">
              What clients say
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {data.map((t) => (
            <Reveal key={t.id}>
              <figure className="h-full border-t border-line pt-8">
                <blockquote className="text-body leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-6">
                  <span className="block text-sm font-medium text-ink">{t.author_name}</span>
                  {t.author_detail && (
                    <span className="block text-sm text-stone mt-1">{t.author_detail}</span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;