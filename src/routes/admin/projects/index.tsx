import { createFileRoute } from "@tanstack/react-router";
import AdminProjects from "@/pages/admin/AdminProjects";

export const Route = createFileRoute("/admin/projects/")({
  component: AdminProjects,
});
