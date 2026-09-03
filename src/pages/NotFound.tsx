import { Link, useLocation } from "@/lib/router-compat";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import Reveal from "@/components/Reveal";
import { pageHeader } from "@/lib/rhythm";

const LINKS = [
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: no route for", location.pathname);
  }, [location.pathname]);

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />

      <Reveal>
        <header className={`${pageHeader} pb-20 md:pb-28`}>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">
            404
          </p>
          <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">
            Page not found
          </h1>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-stone">
            The page you were looking for is not here. It may have moved, or the
            address may be slightly off.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="link-inline group">
                {link.label}
                <ArrowRight className="ml-2 inline h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </header>
      </Reveal>

      <GlobalFooter />
    </main>
  );
};

export default NotFound;
