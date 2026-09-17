import { Link, useLocation, useNavigate } from "@/lib/router-compat";
import BrandLogo from "@/components/BrandLogo";
import SocialLinks from "@/components/SocialLinks";
import { ACCREDITATIONS, FIRM } from "@/content/firm";
import { container } from "@/lib/rhythm";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const colHeading = "text-[11px] font-medium uppercase tracking-[0.16em] text-paper/70 mb-5";

const GlobalFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const contact = settings.contact;

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // ScrollToTop component handles scrolling to top on route change
      navigate("/");
    }
  };

  return (
    <footer className="bg-ink text-paper">
      <div className="border-b border-paper/10 border-t border-paper/10">
        <div className={`${container.wide} py-5`}>
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.16em] text-paper/55 sm:text-[11px]">
            {ACCREDITATIONS}
          </p>
        </div>
      </div>
      <div className="pt-16 pb-8">
      <div className={container.wide}>
        <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr] lg:gap-16">
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
            <SocialLinks className="mt-6" />
          </div>

          {/* Studio */}
          <div>
            <p className={colHeading}>Studio</p>
            <p className="text-sm text-paper/70 mb-1">{contact.addressLine1}</p>
            <p className="text-sm text-paper/70 mb-1">{contact.addressLine2}</p>
            <p className="text-sm text-paper/70">{contact.officeHours}</p>
          </div>

          {/* Contact */}
          <div>
            <p className={colHeading}>Contact</p>
            <a href={contact.phoneHref} className="block text-sm text-paper/70 hover:text-paper transition-colors mb-1">
              {contact.phone}
            </a>
            <p className="text-sm text-paper/70 mb-1">Fax {contact.fax}</p>
            <a href={`mailto:${contact.email}`} className="block text-sm text-paper/70 hover:text-paper transition-colors break-words">
              {contact.email}
            </a>
          </div>

        </div>

        <div className="border-t border-paper/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-paper/70">© 2026 {FIRM.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a
              href="https://www.deerva.com/?utm_source=hallidayarchitects.com&utm_medium=referral&utm_campaign=platform-badge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-paper/70 hover:text-paper transition-colors"
            >
              Platform developed and maintained by Deerva
            </a>
            <Link to="/admin" className="text-xs text-paper/70 hover:text-paper transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
