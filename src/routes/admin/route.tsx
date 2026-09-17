import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

/**
 * The single sign-in gate for the whole admin area. Every page under /admin
 * passes through here, so no page carries its own session check any more —
 * pages only declare the role they need, via <AdminSection>.
 *
 * Three paths stay outside the gate: the login screen, the invitation /
 * recovery screen, and the preview routes, which render public pages inside
 * the admin's preview window and must not get the admin chrome.
 */
const UNGATED = ["/admin/login", "/admin/set-password", "/admin/preview"];

export const Route = createFileRoute("/admin")({
  // Session lives in the browser; there is nothing to render on the server.
  ssr: false,
  component: AdminLayout,
});

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
  </div>
);

function AdminLayout() {
  const { pathname } = useLocation();
  const auth = useAdminAuth();

  if (UNGATED.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return <Outlet />;
  }

  if (auth.status === "loading") return <Spinner />;
  if (auth.status === "unauthorized") return <Navigate to="/admin/login" replace />;

  return (
    <AdminShell email={auth.email} role={auth.role}>
      <Outlet />
    </AdminShell>
  );
}
