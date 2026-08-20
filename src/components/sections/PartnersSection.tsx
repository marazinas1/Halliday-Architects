import Reveal from "@/components/Reveal";
import { container, sectionPadding } from "@/lib/rhythm";
import ocdgLogo from "@/assets/partner-ocdg-logo.png";
import hallidayLeonardLogo from "@/assets/partner-halliday-leonard.jpg";

const PARTNERS = [
  {
    name: "Halliday-Leonard General Contractors",
    href: "https://www.hallidayleonardllc.com/",
    logo: hallidayLeonardLogo,
    blurb:
      "Our construction partner on many shore residences. Halliday-Leonard builds with a level of care that lets a drawing survive the field, and their input during design keeps details buildable.",
  },
  {
    name: "Ocean City Development Group",
    href: "https://oceancitydevelopment.com",
    logo: ocdgLogo,
    blurb:
      "A development partner in Ocean City, bringing sites, programme and market knowledge to new homes we design along the island.",
  },
];

const PartnersSection = () => (
  <section className={sectionPadding.base}>
    <div className={container.narrow}>
      <Reveal>
        <div className="text-center mb-16">
          <p className="label-uppercase mb-4">Our Partners</p>
          <h2 className="heading-section text-ink mb-6">Trusted collaborators</h2>
          <div className="divider mx-auto" />
        </div>
      </Reveal>

      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        {PARTNERS.map((partner, i) => (
          <Reveal key={partner.name} delay={i * 100}>
            <a
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col items-center text-center"
            >
              <div className="mb-8 flex h-20 items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-16 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className="heading-card mb-4 text-ink underline-offset-4 group-hover:underline">
                {partner.name}
              </h3>
              <p className="text-body">{partner.blurb}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default PartnersSection;