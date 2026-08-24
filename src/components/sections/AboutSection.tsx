import Reveal from "@/components/Reveal";
import SectionLink from "@/components/SectionLink";
import { container, sectionPadding } from "@/lib/rhythm";

// Studio photograph has not been supplied yet. Setting this to an imported
// asset restores the two-column layout (image left, prose right).
const STUDIO_IMAGE: string | null = null;

const AboutSection = () => {
  // No photograph yet: render the prose as a single centred column so the
  // page never shows an empty grey box.
  if (!STUDIO_IMAGE) {
    return (
      <section className={`${sectionPadding.base}`}>
        <div className={container.content}>
          <Reveal>
            <div className="text-center">
              <p className="label-uppercase mb-4">About Us</p>
              <h2 className="heading-section text-ink mb-6">
                Residential architecture
                <br />
                in Ocean City, New Jersey
              </h2>
              <div className="divider mx-auto mb-8" />
              <p className="text-body mb-6">
                Halliday Architects is a residential architecture practice in Ocean City, New Jersey,
                led by Christopher and Shannon Halliday. Both are registered architects and LEED
                accredited professionals, and the studio has worked along the shore since 2013.
              </p>
              <p className="text-body mb-6">
                The work draws on the local vernacular, on current building technology, and on the
                functional relationships between the spaces of a house. New homes, additions,
                renovations and interiors — each one designed for its site and for the family who
                will live in it.
              </p>
              <p className="text-body mb-10">
                The studio is deliberately small. Every project is led personally by a principal,
                from the first site visit through construction administration, so the person who
                drew the house is the person answering questions on site.
              </p>
              <SectionLink to="/services">Services</SectionLink>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  // Photograph supplied: render the two-column layout.
  return (
    <section className={`${sectionPadding.base}`}>
      <div className={container.wide}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <Reveal className="lg:col-span-7">
            <div>
              <img
                src={STUDIO_IMAGE}
                alt=""
                className="w-full object-cover aspect-[4/5] lg:aspect-auto lg:h-[600px]"
              />
            </div>
          </Reveal>
          <Reveal className="lg:col-span-5">
            <div>
              <p className="label-uppercase mb-4">About Us</p>
              <h2 className="heading-section text-ink mb-6">
                Residential architecture
                <br />
                in Ocean City, New Jersey
              </h2>
              <div className="divider mb-8" />
              <p className="text-body mb-6">
                Halliday Architects is a residential architecture practice in Ocean City, New Jersey,
                led by Christopher and Shannon Halliday. Both are registered architects and LEED
                accredited professionals, and the studio has worked along the shore since 2013.
              </p>
              <p className="text-body mb-6">
                The work draws on the local vernacular, on current building technology, and on the
                functional relationships between the spaces of a house. New homes, additions,
                renovations and interiors — each one designed for its site and for the family who
                will live in it.
              </p>
              <p className="text-body mb-6">
                The studio is deliberately small. Every project is led personally by a principal,
                from the first site visit through construction administration, so the person who
                drew the house is the person answering questions on site.
              </p>
              <SectionLink to="/services">Services</SectionLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
