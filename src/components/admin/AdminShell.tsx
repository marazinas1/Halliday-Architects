import { ReactNode } from "react";
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
      <div className="min-h-screen flex w-full bg-sand">
        <AdminSidebar email={email} role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-line bg-card px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <span className="font-medium text-ink tracking-tight truncate">
              {settings.siteName} Admin
            </span>
          </header>
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
