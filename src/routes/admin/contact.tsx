import { createFileRoute } from "@tanstack/react-router";
import AdminContact from "@/pages/admin/AdminContact";

export const Route = createFileRoute("/admin/contact")({
  component: AdminContact,
});
