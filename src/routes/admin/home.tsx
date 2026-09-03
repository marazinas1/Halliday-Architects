import { createFileRoute } from "@tanstack/react-router";
import AdminHome from "@/pages/admin/AdminHome";

export const Route = createFileRoute("/admin/home")({
  component: AdminHome,
});
