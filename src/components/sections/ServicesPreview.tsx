import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { HOMEPAGE_SERVICES } from "@/content/firm";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Homepage services preview — six grouped services (HOMEPAGE_SERVICES in
 * src/content/firm.ts) that summarise the full eleven listed on /services.
 * Centered header, centered cards, one centered link below.
 */
const ServicesPreview = () => (
  <section className={`${sectionPadding.base} bg-background`}>
    <div className={container.wide}>
      <Reveal>
        <div className="section-head">
          <span className="label-uppercase">What we do</span>
          <h2 className="heading-section text-ink">Services</h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 lg:gap-x-12">
        {HOMEPAGE_SERVICES.map((s) => (
          <Reveal key={s.title}>
            <Link to="/services" className="group flex flex-col items-center text-center gap-4">
              <span className="w-12 h-12 rounded-full border border-line grid place-items-center text-ink transition-colors duration-300 group-hover:border-ink">
                <s.icon size={20} strokeWidth={1.5} />
              </span>
              <h3 className="heading-card text-ink transition-colors duration-500 ease-out group-hover:text-brand">
                {s.title}
              </h3>
              <p className="text-body max-w-[30ch]">{s.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="below-link">
          <Link to="/services" className="link-inline">
            All services
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);

export default ServicesPreview;
