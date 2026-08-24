import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { HOMEPAGE_SERVICES } from "@/content/firm";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Homepage services preview — six grouped services (HOMEPAGE_SERVICES in
 * src/content/firm.ts) that summarise the full eleven listed on /services.
 * Bordered circular icon chips lead each item.
 */
const ServicesPreview = () => (
  <section className={`${sectionPadding.base} bg-background`}>
    <div className={container.wide}>
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
          <p className="label-uppercase lg:col-span-3 lg:pt-3">What we do</p>
          <div className="lg:col-span-9 flex flex-wrap items-end justify-between gap-6">
            <h2 className="heading-section text-ink max-w-2xl">Services</h2>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:gap-3 transition-all"
            >
              All services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 lg:gap-x-12">
        {HOMEPAGE_SERVICES.map((s) => (
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
