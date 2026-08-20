import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { container } from "@/lib/rhythm";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const CTA_LABEL = "Start a project";

/**
 * `lightHero` is set by pages whose hero is a light surface (currently the
 * homepage, while it waits for real photography). It keeps the nav in its
 * dark-on-light treatment so the links stay legible without an image behind
 * them.
 */
const GlobalNav = ({ lightHero = false }: { lightHero?: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** True whenever the nav sits on a light surface. */
  const onLight = isScrolled || lightHero;

  const linkClass = (isActive: boolean) =>
    `text-xs tracking-[0.12em] uppercase font-medium transition-all duration-300 ${
      onLight
        ? isActive
          ? "text-ink"
          : "text-stone hover:text-ink"
        : isActive
          ? "text-paper"
          : "text-paper/80 hover:text-paper"
    }`;
  const textShadow = !onLight ? "0 1px 3px rgba(0,0,0,0.4)" : "none";

  return (
    <>
      {!onLight && (
        <div className="fixed top-0 left-0 right-0 h-40 z-40 pointer-events-none bg-gradient-to-b from-ink/70 via-ink/35 to-transparent" />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass-nav shadow-sm" : "bg-transparent"
        }`}
      >
        <nav className={container.wide}>
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center transition-opacity hover:opacity-80"
              aria-label="Halliday Architects — Home"
            >
              <BrandLogo
                variant={onLight ? "light" : "dark"}
                className="h-9 md:h-11 w-auto transition-all duration-500"
                style={{
                  filter: !onLight ? "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" : undefined,
                }}
              />
            </Link>

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => linkClass(isActive)} style={{ textShadow }}>
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                className={`group ml-1 inline-flex items-center gap-2 h-11 px-6 rounded text-xs font-medium uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-90 ${
                  onLight ? "bg-ink text-paper" : "bg-paper text-ink"
                }`}
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
                <span className={`w-full h-0.5 transition-all duration-300 ${onLight ? "bg-ink" : "bg-paper"} ${isMobileMenuOpen ? "rotate-45 translate-y-2 bg-ink" : ""}`} />
                <span className={`w-full h-0.5 transition-all duration-300 ${onLight ? "bg-ink" : "bg-paper"} ${isMobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`w-full h-0.5 transition-all duration-300 ${onLight ? "bg-ink" : "bg-paper"} ${isMobileMenuOpen ? "-rotate-45 -translate-y-2 bg-ink" : ""}`} />
              </div>
            </button>
          </div>

          {/* Mobile menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 absolute top-full left-0 right-0 ${isMobileMenuOpen ? "max-h-[600px]" : "max-h-0"}`}>
            <div className={`flex flex-col gap-5 px-6 pt-6 pb-8 ${onLight ? "bg-paper border-t border-border" : "bg-ink"}`}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-left text-sm tracking-wider uppercase transition-colors ${onLight ? "text-stone hover:text-ink" : "text-paper/90 hover:text-paper"}`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group mt-2 inline-flex items-center justify-center gap-2 h-12 w-full rounded text-sm font-medium uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-90 ${
                  onLight ? "bg-ink text-paper" : "bg-paper text-ink"
                }`}
              >
                {CTA_LABEL}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default GlobalNav;
