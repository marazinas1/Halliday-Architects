import { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { ShieldAlert } from "lucide-react";
import { useAdminAuth, canAccess, type AdminAccess } from "@/hooks/admin/useAdminAuth";
import { Button } from "@/components/ui/button";

/**
 * Role gate for a single admin page. The sign-in gate lives once, in the
 * `/admin` layout route — this only decides whether the signed-in role may
 * open this particular section. Disabling a sidebar link is presentation
 * only, so pages an editor must not reach still declare `access="owner"`.
 */
export default function AdminSection({
  children,
  access = "staff",
}: {
  children: ReactNode;
  access?: AdminAccess;
}) {
  const auth = useAdminAuth();

  if (auth.status !== "authorized") return null;

  if (!canAccess(auth.role, access)) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <ShieldAlert className="h-8 w-8 mx-auto text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          You don't have access to this section
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Only owners can open this page. Ask an owner if you need access.
        </p>
        <Button asChild className="mt-8">
          <Link to="/admin">Back to the dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
