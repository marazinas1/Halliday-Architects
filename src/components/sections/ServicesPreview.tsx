import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { SERVICES } from "@/content/firm";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Homepage services preview — bordered circular icon chips lead each item.
 * The list itself comes from src/content/firm.ts (the practice's public
 * Houzz "Services Provided").
 */
const ServicesPreview = () => (
  <section className={`${sectionPadding.base} bg-background`}>
    <div className={container.wide}>
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
          <p className="label-uppercase lg:col-span-3 lg:pt-3">What we do</p>
          <h2 className="heading-section text-ink lg:col-span-9 max-w-2xl">Services</h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 lg:gap-x-12">
        {SERVICES.map((s) => (
          <Reveal key={s.title}>
            <Link to="/services" className="group flex flex-col gap-4">
              <span className="w-11 h-11 rounded-full border border-line grid place-items-center text-ink transition-colors duration-300 group-hover:border-ink">
                <s.icon size={20} strokeWidth={1.5} />
              </span>
              <h3 className="heading-card text-ink text-lg transition-colors duration-500 ease-out group-hover:text-brand">
                {s.title}
              </h3>
              <p className="text-body text-sm leading-relaxed">{s.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesPreview;
