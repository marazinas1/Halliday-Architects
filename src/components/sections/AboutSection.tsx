import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import aboutImg from "@/assets/asbury-ext-01.jpg";

const AboutSection = () => (
  <section className="section-padding">
    <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <Reveal>
          <div className="relative overflow-hidden" style={{ borderRadius: "4px" }}>
            <img
              src={aboutImg}
              alt="A Halliday Leonard custom home"
              className="w-full object-cover object-center aspect-[4/5] lg:aspect-auto lg:h-[600px]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Reveal>
        <Reveal>
          <div>
            <p className="label-uppercase mb-4">About Us</p>
            <h2 className="heading-section text-charcoal mb-6">
              Forty Years of Coastal
              <br />
              Craftsmanship
            </h2>
            <div className="divider mb-8" />
            <p className="text-body mb-6">
              Halliday-Leonard has been consistently delivering the highest-quality custom homes in
              the Ocean City, New Jersey area for over 40 years. From primary residences to vacation
              retreats, our staff delivers exactly what the customer desires.
            </p>
            <p className="text-body mb-6">
              From single family to multi family, on your lot or ours — let Ocean City's premier home
              builder begin creating your dream home today. Every project is led personally by one of
              our four partners, on time and on budget.
            </p>
            <p className="text-lg font-serif italic text-charcoal/80 mb-8">
              Your dream home — our experience and execution.
            </p>
            <Link to="/services" className="btn-outline text-xs inline-flex">
              Explore Our Services
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default AboutSection;
