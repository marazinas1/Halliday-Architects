import { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { Home } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { AdminRole } from "@/hooks/admin/useAdminAuth";

export default function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: AdminRole;
  children: ReactNode;
}) {
  const { settings } = useSiteSettings();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted">
        <AdminSidebar email={email} role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <span className="font-medium text-foreground tracking-tight truncate">
              {settings.siteName} Admin
            </span>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
          </header>
          <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-6 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
