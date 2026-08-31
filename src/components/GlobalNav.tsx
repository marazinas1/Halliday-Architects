import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { container } from "@/lib/rhythm";

const NAV_LINKS = [
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

/** Temporary: the three homepage concepts being reviewed with the client. */
const HOME_VERSIONS = [
  { label: "Home V1", to: "/" },
  { label: "Home V2", to: "/home-v2" },
  { label: "Home V3", to: "/home-v3" },
];

const CTA_LABEL = "Start a project";

/**
 * Sticky, solid-white navigation — 5rem tall with a hairline bottom border.
 * The bar sits in the flow rather than floating over the hero, so the links
 * are always dark on light and no scrim is needed.
 *
 * `lightHero` is retained only so existing call sites keep compiling; the nav
 * has a single treatment now and the prop has no effect.
 */
const GlobalNav = (_props: { lightHero?: boolean }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isHomeActive = HOME_VERSIONS.some((v) => v.to === pathname);

  const linkClass = (isActive: boolean) =>
    `text-[11px] tracking-[0.16em] uppercase font-medium transition-colors duration-300 ${
      isActive ? "text-ink" : "text-stone hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-line">
      <nav className={container.wide}>
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex-shrink-0 flex items-center transition-opacity hover:opacity-80"
            aria-label="Halliday Architects — Home"
          >
            <BrandLogo variant="light" className="h-9 md:h-11 w-auto" />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Home concepts — temporary while the client compares homepage versions. */}
            <div className="relative group">
              <button
                type="button"
                className={`inline-flex items-center gap-1 ${linkClass(isHomeActive)}`}
                aria-haspopup="menu"
              >
                Home
                <ChevronDown size={13} className="transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 top-full pt-3 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible">
                <div className="min-w-[11rem] bg-background border border-line shadow-sm py-2">
                  {HOME_VERSIONS.map((v) => (
                    <NavLink
                      key={v.to}
                      to={v.to}
                      end
                      className={({ isActive }) =>
                        `block px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition-colors ${
                          isActive ? "text-ink" : "text-stone hover:text-ink"
                        }`
                      }
                    >
                      {v.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => linkClass(isActive)}
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="group ml-2 inline-flex items-center gap-2 h-11 px-6 bg-ink text-paper text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-90"
            >
              {CTA_LABEL}
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-ink transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-full h-0.5 bg-ink transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-full h-0.5 bg-ink transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 absolute top-full left-0 right-0 ${
            isMobileMenuOpen ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-5 px-6 pt-6 pb-8 bg-background border-b border-line">
            <div className="flex flex-col gap-3">
              <span className="text-left text-sm tracking-wider uppercase text-ink">Home</span>
              {HOME_VERSIONS.map((v) => (
                <Link
                  key={v.to}
                  to={v.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pl-4 text-left text-sm tracking-wider uppercase text-stone hover:text-ink transition-colors"
                >
                  {v.label}
                </Link>
              ))}
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left text-sm tracking-wider uppercase text-stone hover:text-ink transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group mt-2 inline-flex items-center justify-center gap-2 h-12 w-full bg-ink text-paper text-sm font-medium uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-90"
            >
              {CTA_LABEL}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default GlobalNav;
