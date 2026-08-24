import Reveal from "@/components/Reveal";
import { container, sectionPadding } from "@/lib/rhythm";
import { COASTAL_NOTE, SERVICES } from "@/content/firm";

/**
 * Services come from src/content/firm.ts (the practice's public Houzz
 * "Services Provided" list). This file only supplies presentation —
 * the same icon-chip cards used by the homepage preview.
 */
export const services = SERVICES;

const ServiceCard = ({ s }: { s: (typeof services)[0] }) => (
  <div className="flex flex-col gap-4">
    <span className="w-11 h-11 rounded-full border border-line grid place-items-center text-ink">
      <s.icon size={20} strokeWidth={1.5} />
    </span>
    <h3 className="heading-card text-ink text-lg">{s.title}</h3>
    <p className="text-body text-sm leading-relaxed">{s.description}</p>
  </div>
);

export const ServicesGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 lg:gap-x-12">
    {services.map((s) => (
      <Reveal key={s.title}>
        <ServiceCard s={s} />
      </Reveal>
    ))}
  </div>
);

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
