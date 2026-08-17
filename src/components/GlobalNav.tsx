import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "@/assets/halliday-logo.png";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

const GlobalNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = (isActive: boolean) =>
    `text-xs tracking-[0.12em] uppercase font-medium transition-all duration-300 ${
      isScrolled
        ? isActive
          ? "text-charcoal"
          : "text-slate hover:text-charcoal"
        : isActive
          ? "text-paper"
          : "text-paper/80 hover:text-paper"
    }`;
  const textShadow = !isScrolled ? "0 1px 3px rgba(0,0,0,0.4)" : "none";

  return (
    <>
      {!isScrolled && (
        <div className="fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none bg-gradient-to-b from-black/50 via-black/25 to-transparent" />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass-nav shadow-sm" : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center transition-opacity hover:opacity-80"
              aria-label="Halliday Architects — Home"
            >
              <img
                src={logo}
                alt="Halliday Architects"
                className="h-9 md:h-11 w-auto transition-all duration-500"
                style={{
                  filter: !isScrolled
                    ? "brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
                    : "none",
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
                className={`text-xs py-2.5 px-6 font-medium tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isScrolled
                    ? "bg-charcoal text-paper"
                    : "bg-paper/20 backdrop-blur-sm border border-paper/40 text-paper hover:bg-paper hover:text-charcoal"
                }`}
                style={{ borderRadius: "4px" }}
              >
                Start a Project
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 -mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 transition-all duration-300 ${isScrolled ? "bg-charcoal" : "bg-paper"} ${isMobileMenuOpen ? "rotate-45 translate-y-2 bg-charcoal" : ""}`} />
                <span className={`w-full h-0.5 transition-all duration-300 ${isScrolled ? "bg-charcoal" : "bg-paper"} ${isMobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`w-full h-0.5 transition-all duration-300 ${isScrolled ? "bg-charcoal" : "bg-paper"} ${isMobileMenuOpen ? "-rotate-45 -translate-y-2 bg-charcoal" : ""}`} />
              </div>
            </button>
          </div>

          {/* Mobile menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 absolute top-full left-0 right-0 ${isMobileMenuOpen ? "max-h-[600px]" : "max-h-0"}`}>
            <div className={`flex flex-col gap-5 px-6 pt-6 pb-8 ${isScrolled ? "bg-paper border-t border-border" : "bg-charcoal"}`}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-left text-sm tracking-wider uppercase transition-colors ${isScrolled ? "text-slate hover:text-charcoal" : "text-paper/90 hover:text-paper"}`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xs mt-2 w-fit py-2.5 px-6 font-medium tracking-wider uppercase transition-all duration-300 ${
                  isScrolled ? "bg-charcoal text-paper" : "bg-paper text-charcoal"
                }`}
                style={{ borderRadius: "4px" }}
              >
                Start a Project
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default GlobalNav;
