import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { FIRM } from "@/content/firm";
import { container } from "@/lib/rhythm";

const NAV_LINKS = [
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

/**
 * Shared site navigation. On the homepage it begins over the photograph wall
 * and becomes solid once that wall has passed. Internal pages are always solid.
 */
const GlobalNav = ({ overlayPhotoWall = false }: { lightHero?: boolean; overlayPhotoWall?: boolean }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOverPhoto, setIsOverPhoto] = useState(overlayPhotoWall);

  useEffect(() => {
    if (!overlayPhotoWall) {
      setIsOverPhoto(false);
      return;
    }
    const sync = () => {
      const wall = document.getElementById("home-photo-wall");
      setIsOverPhoto(Boolean(wall && wall.getBoundingClientRect().bottom > 80));
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [overlayPhotoWall]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const linkClass = (isActive: boolean) =>
    `text-xs tracking-[0.14em] uppercase font-medium transition-colors duration-300 ${
      isOverPhoto ? "text-paper hover:text-paper/70" : isActive ? "text-ink" : "text-stone hover:text-ink"
    }`;

  return (
    <header className={`${overlayPhotoWall ? "fixed" : "sticky"} inset-x-0 top-0 z-50 transition-colors duration-300 ${isOverPhoto ? "border-b border-transparent bg-transparent" : "border-b border-line bg-background"}`}>
      {isOverPhoto && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/50 via-ink/20 to-transparent" />}
      <nav className={container.wide}>
        <div className="relative flex h-20 items-center justify-between">
          <Link
            to="/"
            className="flex-shrink-0 flex items-center transition-opacity hover:opacity-80"
            aria-label="Halliday Architects — Home"
          >
            <BrandLogo variant={isOverPhoto ? "dark" : "light"} className="h-9 w-auto md:h-11" />
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => linkClass(isActive)}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <Button
            type="button" variant="ghost" size="icon"
            className={`min-h-11 min-w-11 md:hidden ${isOverPhoto ? "text-paper hover:bg-paper/10 hover:text-paper" : "text-ink"}`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[70] flex flex-col bg-background px-6 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`} aria-hidden={!isMobileMenuOpen}>
        <div className="flex h-20 items-center justify-between">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} aria-label={`${FIRM.name} — Home`}>
            <BrandLogo variant="light" className="h-9 w-auto" />
          </Link>
          <Button type="button" variant="ghost" size="icon" className="min-h-11 min-w-11" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="mt-8 flex flex-col">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className="border-b border-line py-4 text-2xl font-semibold text-ink">
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto pb-8 text-sm leading-relaxed text-stone">
          <a href={FIRM.phoneHref} className="block hover:text-ink">{FIRM.phone}</a>
          <a href={`mailto:${FIRM.email}`} className="block hover:text-ink">{FIRM.email}</a>
          <p className="mt-3">{FIRM.address1}<br />{FIRM.address2}</p>
        </div>
      </div>
    </header>
  );
};

export default GlobalNav;
