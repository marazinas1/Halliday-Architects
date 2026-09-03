import { createFileRoute } from "@tanstack/react-router";
import AdminProjectForm from "@/pages/admin/AdminProjectForm";

export const Route = createFileRoute("/admin/projects/$id/edit")({
  component: AdminProjectForm,
});
