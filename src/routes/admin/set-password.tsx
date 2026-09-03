import { createFileRoute } from "@tanstack/react-router";
import AdminSetPassword from "@/pages/admin/AdminSetPassword";

export const Route = createFileRoute("/admin/set-password")({
  component: AdminSetPassword,
});
