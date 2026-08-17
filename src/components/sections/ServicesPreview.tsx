import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { SERVICES } from "@/content/firm";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Homepage services preview — large drawing-notation numerals lead each item.
 * Copy comes from src/content/firm.ts (placeholder, awaiting the client).
 */
const ServicesPreview = () => (
  <section className={`${sectionPadding.base} section-sand`}>
    <div className={container.wide}>
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
          <p className="label-uppercase lg:col-span-3 lg:pt-3">What we do</p>
          <h2 className="heading-section text-ink lg:col-span-9 max-w-2xl">Services</h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title}>
            <Link to="/services" className="group block">
              <span className="numeral block text-5xl md:text-6xl lg:text-7xl mb-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="heading-card text-ink text-lg transition-colors duration-500 ease-out group-hover:text-brand">
                {s.title}
              </h3>
              <p className="text-body text-sm mt-3 leading-relaxed">{s.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesPreview;
