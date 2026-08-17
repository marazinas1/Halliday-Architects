import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/halliday-logo.png";
import { FIRM } from "@/content/firm";
import { container } from "@/lib/rhythm";

const FOOTER_LINKS = [
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

const GlobalFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // ScrollToTop component handles scrolling to top on route change
      navigate("/");
    }
  };

  return (
    <footer className="bg-ink text-paper py-16">
      <div className={container.wide}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <button
              type="button"
              onClick={handleLogoClick}
              className="cursor-pointer text-left"
              aria-label={`${FIRM.name} — Home`}
            >
              <img
                src={logo}
                alt={FIRM.name}
                className="h-12 w-auto mb-5"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </button>
            <p className="text-sm text-paper/60 leading-relaxed">{FIRM.tagline}</p>
          </div>
          <div>
            <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-paper/40 mb-4">Contact</h4>
            <p className="text-sm text-paper/70 mb-1">{FIRM.address1}</p>
            <p className="text-sm text-paper/70 mb-3">{FIRM.address2}</p>
            <a href={FIRM.phoneHref} className="block text-sm text-paper/70 hover:text-paper transition-colors mb-1">{FIRM.phone}</a>
            <p className="text-sm text-paper/70 mb-1">Fax {FIRM.fax}</p>
            <a href={`mailto:${FIRM.email}`} className="block text-sm text-paper/70 hover:text-paper transition-colors">
              {FIRM.email}
            </a>
          </div>
          <div>
            <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-paper/40 mb-4">Explore</h4>
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block text-sm text-paper/70 hover:text-paper transition-colors mb-1 text-left"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-paper/10 pt-8 text-center">
          <p className="text-xs text-paper/40">© 2026 {FIRM.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
