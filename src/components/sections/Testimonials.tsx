import Reveal from "@/components/Reveal";
import { useTestimonials } from "@/hooks/useTestimonials";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Client words, in the site's quiet editorial voice. Nothing renders until the
 * practice publishes a quote in the admin panel — no placeholders, no invented
 * reviews and no counts.
 */
const Testimonials = () => {
  const { data } = useTestimonials();
  if (!data || data.length === 0) return null;
  const items = data.slice(0, 3);

  return (
    <section className={`${sectionPadding.base} border-t border-line`}>
      <div className={container.wide}>
        <Reveal>
          <div className="section-head">
            <span className="label-uppercase">In their words</span>
            <h2 className="heading-section text-ink">What clients say</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-20">
          {items.map((t, index) => (
            <Reveal key={t.id} delay={index * 150}>
              <figure className="flex h-full flex-col items-center text-center">
                <blockquote className="max-w-[34ch] text-[15px] leading-[1.9] text-stone">
                  “{t.quote}”
                </blockquote>
                <div className="my-6 h-px w-8 bg-line" />
                <figcaption>
                  <span className="block text-sm font-medium text-ink">{t.author_name}</span>
                  {t.author_detail && (
                    <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-stone">
                      {t.author_detail}
                    </span>
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
