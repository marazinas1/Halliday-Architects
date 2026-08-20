import { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAdminAuth, canAccess, type AdminAccess } from "@/hooks/admin/useAdminAuth";
import AdminShell from "./AdminShell";
import { Button } from "@/components/ui/button";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
  </div>
);

/**
 * Route guard. `access="owner"` blocks editors even if they type the URL
 * directly — disabling a sidebar link is presentation only.
 */
export default function AdminProtected({
  children,
  access = "staff",
}: {
  children: ReactNode;
  access?: AdminAccess;
}) {
  const auth = useAdminAuth();

  if (auth.status === "loading") return <Spinner />;
  if (auth.status === "unauthorized") return <Navigate to="/admin/login" replace />;

  if (!canAccess(auth.role, access)) {
    return (
      <AdminShell email={auth.email} role={auth.role}>
        <div className="max-w-md mx-auto text-center py-20">
          <ShieldAlert className="h-8 w-8 mx-auto text-stone" />
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
            You don't have access to this section
          </h1>
          <p className="mt-3 text-sm text-stone">
            Only owners can open this page. Ask an owner if you need access.
          </p>
          <Button asChild className="mt-8">
            <Link to="/admin">Back to Projects</Link>
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell email={auth.email} role={auth.role}>
      {children}
    </AdminShell>
  );
}
