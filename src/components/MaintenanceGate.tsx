import { type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

/**
 * Maintenance mode. When the switch is on in the admin settings, visitors get
 * a holding page on every public route. Signed-in staff keep browsing the
 * real site and see a banner reminding them the site is closed to visitors.
 * The admin area itself is never held back.
 */
export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { settings } = useSiteSettings();

  if (pathname.startsWith("/admin")) return <>{children}</>;
  if (!settings.maintenance.enabled) return <>{children}</>;

  return <MaintenanceCheck message={settings.maintenance.message}>{children}</MaintenanceCheck>;
}

function MaintenanceCheck({ message, children }: { message: string; children: ReactNode }) {
  const auth = useAdminAuth();

  // Until we know who this is, assume a visitor — the holding page must never
  // flash the real site to the public.
  if (auth.status !== "authorized") return <HoldingPage message={message} />;

  return (
    <>
      <div className="sticky top-0 z-50 bg-ink px-4 py-2 text-center text-xs font-medium text-white">
        Maintenance mode is on — visitors see a holding page. You are signed in, so you see the site.
      </div>
      {children}
    </>
  );
}

function HoldingPage({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Halliday Architects
        </h1>
        <p className="mt-6 text-base leading-relaxed text-stone">{message}</p>
      </div>
    </main>
  );
}
