import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { container, sectionPadding } from "@/lib/rhythm";

/** Neutral placeholder until the client's photography arrives. */
const aboutImg = "/placeholder.svg";

const AboutSection = () => (
  <section className={`${sectionPadding.base}`}>
    <div className={container.wide}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <Reveal>
          <div className="relative overflow-hidden bg-muted" style={{ borderRadius: "4px" }}>
            <img
              src={aboutImg}
              alt=""
              aria-hidden="true"
              className="w-full object-cover object-center aspect-[4/5] lg:aspect-auto lg:h-[600px]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Reveal>
        <Reveal>
          <div>
            <p className="label-uppercase mb-4">About Us</p>
            <h2 className="heading-section text-ink mb-6">
              Architecture for the
              <br />
              Jersey Shore
            </h2>
            <div className="divider mb-8" />
            {/* PLACEHOLDER COPY — awaiting the client's own words. */}
            <p className="text-body mb-6">
              Halliday Architects is an architecture practice in Ocean City, New Jersey, led by
              Christopher Halliday (RA, LEED AP) and Shannon Halliday. The studio works on
              residential architecture along the shore.
            </p>
            <p className="text-body mb-6">
              Every project is led personally by a principal, from the first sketch through
              construction administration.
            </p>
            <Link to="/services" className="btn-outline text-xs inline-flex">
              Services
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default AboutSection;
