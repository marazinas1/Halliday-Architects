import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import SocialLinks from "@/components/SocialLinks";
import { FIRM } from "@/content/firm";
import { container } from "@/lib/rhythm";

const EXPLORE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const colHeading = "text-[11px] font-medium uppercase tracking-[0.16em] text-paper/40 mb-5";
const colLink = "block text-sm text-paper/70 hover:text-paper transition-colors mb-2 text-left";

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
    <footer className="bg-ink text-paper pt-16 pb-8">
      <div className={container.wide}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12">
          {/* Brand */}
          <div>
            <button
              type="button"
              onClick={handleLogoClick}
              className="cursor-pointer text-left"
              aria-label={`${FIRM.name} — Home`}
            >
              <BrandLogo variant="dark" className="h-12 w-auto mb-5" />
            </button>
            <p className="text-sm text-paper/60 leading-relaxed max-w-xs">{FIRM.tagline}</p>
          </div>

          {/* Studio */}
          <div>
            <h4 className={colHeading}>Studio</h4>
            {STUDIO_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={colLink}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 className={colHeading}>Contact</h4>
            <p className="text-sm text-paper/70 mb-1">{FIRM.address1}</p>
            <p className="text-sm text-paper/70 mb-3">{FIRM.address2}</p>
            <a href={FIRM.phoneHref} className="block text-sm text-paper/70 hover:text-paper transition-colors mb-1">
              {FIRM.phone}
            </a>
            <p className="text-sm text-paper/70 mb-1">Fax {FIRM.fax}</p>
            <a href={`mailto:${FIRM.email}`} className="block text-sm text-paper/70 hover:text-paper transition-colors">
              {FIRM.email}
            </a>
          </div>

          {/* Explore + social */}
          <div>
            <h4 className={colHeading}>Explore</h4>
            {EXPLORE_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={colLink}>
                {l.label}
              </Link>
            ))}
            <SocialLinks className="mt-6" />
          </div>
        </div>

        <div className="border-t border-paper/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-paper/40">© 2026 {FIRM.name}. All rights reserved.</p>
          <Link to="/admin" className="text-xs text-paper/30 hover:text-paper/60 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
