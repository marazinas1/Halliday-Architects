import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-card border-b border-line sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-semibold text-ink tracking-tight">
              Halliday Architects Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/admin" className="text-stone hover:text-ink transition-colors">
                Projects
              </Link>
              <Link to="/admin/team" className="text-stone hover:text-ink transition-colors">
                Team
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone hidden sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}