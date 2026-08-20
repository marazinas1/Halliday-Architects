import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import SocialLinks from "@/components/SocialLinks";
import { FIRM } from "@/content/firm";
import { container } from "@/lib/rhythm";

const FOOTER_LINKS = [
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
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
        {/* The columns sit on a shared, narrower measure so the footer reads as
            one centred block rather than three items pushed to the page edges. */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={handleLogoClick}
              className="cursor-pointer text-left"
              aria-label={`${FIRM.name} — Home`}
            >
              <BrandLogo variant="dark" className="h-12 w-auto mb-5" />
            </button>
            <p className="text-sm text-paper/60 leading-relaxed max-w-xs">{FIRM.tagline}</p>
            <SocialLinks className="mt-6" />
          </div>
          <div className="lg:col-span-4">
            <h4 className="text-sm font-sans font-medium uppercase tracking-widest text-paper/40 mb-4">Contact</h4>
            <p className="text-sm text-paper/70 mb-1">{FIRM.address1}</p>
            <p className="text-sm text-paper/70 mb-3">{FIRM.address2}</p>
            <a href={FIRM.phoneHref} className="block text-sm text-paper/70 hover:text-paper transition-colors mb-1">{FIRM.phone}</a>
            <p className="text-sm text-paper/70 mb-1">Fax {FIRM.fax}</p>
            <a href={`mailto:${FIRM.email}`} className="block text-sm text-paper/70 hover:text-paper transition-colors">
              {FIRM.email}
            </a>
          </div>
          <div className="lg:col-span-3">
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
        <div className="mx-auto max-w-5xl border-t border-paper/10 pt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <p className="text-xs text-paper/40">© 2026 {FIRM.name}. All rights reserved.</p>
          <span className="hidden sm:inline text-xs text-paper/20">/</span>
          <Link to="/admin" className="text-xs text-paper/30 hover:text-paper/60 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
