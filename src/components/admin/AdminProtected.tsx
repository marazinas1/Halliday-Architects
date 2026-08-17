import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import AdminShell from "./AdminShell";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
  </div>
);

export default function AdminProtected({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();

  if (auth.status === "loading") return <Spinner />;
  if (auth.status === "unauthorized") return <Navigate to="/admin/login" replace />;

  return <AdminShell email={auth.email}>{children}</AdminShell>;
}