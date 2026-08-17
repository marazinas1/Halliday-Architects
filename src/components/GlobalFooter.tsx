import { Link } from "react-router-dom";
import logoWhite from "@/assets/halliday-leonard-logo-white.png";

const FOOTER_LINKS = [
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Contact", to: "/contact" },
];

const GlobalFooter = () => {
  return (
    <footer className="bg-charcoal text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <img src={logoWhite} alt="Halliday-Leonard General Contractors" className="h-12 w-auto mb-5" />
            <p className="text-sm text-white/60 leading-relaxed">
              Custom homes, developments, and joint ventures. Delivering the highest-quality
              custom homes in the Ocean City, New Jersey area for over 40 years.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-white/40 mb-4">Contact</h4>
            <p className="text-sm text-white/70 mb-1">700 Haven Avenue</p>
            <p className="text-sm text-white/70 mb-3">Ocean City, NJ 08226</p>
            <a href="tel:6093985737" className="block text-sm text-white/70 hover:text-white transition-colors mb-1">609.398.5737</a>
            <a href="mailto:Info@HallidayLeonardInc.com" className="block text-sm text-white/70 hover:text-white transition-colors">
              Info@HallidayLeonardInc.com
            </a>
          </div>
          <div>
            <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-white/40 mb-4">Explore</h4>
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block text-sm text-white/70 hover:text-white transition-colors mb-1 text-left"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/40">
            © 2026 Halliday Leonard General Contractors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
