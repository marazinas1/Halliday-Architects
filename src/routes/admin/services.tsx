import { createFileRoute } from "@tanstack/react-router";
import AdminServices from "@/pages/admin/AdminServices";

export const Route = createFileRoute("/admin/services")({
  component: AdminServices,
});
