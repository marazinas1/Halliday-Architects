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

const PartnersSection = () => {
  if (!PARTNERS.length) return null;

  return (
  <section className={`${sectionPadding.base} border-t border-line`}>
    <div className={container.content}>
      <Reveal>
        <div className="section-head">
          <p className="label-uppercase">Who we build with</p>
          <h2 className="heading-section leading-tight text-ink">Trusted collaborators</h2>
        </div>
      </Reveal>

      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        {PARTNERS.map((partner) => (
          <Reveal key={partner.name}>
            <a
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col items-center text-center"
            >
              <div className="mb-8 flex h-20 items-center justify-center">
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={320}
                  height={64}
                  className="max-h-16 w-auto object-contain opacity-55 grayscale transition-[filter,opacity] duration-500 ease-out group-hover:opacity-100 group-hover:grayscale-0 motion-reduce:transition-none"
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
};

export default PartnersSection;