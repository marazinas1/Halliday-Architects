import { createFileRoute } from "@tanstack/react-router";
import AdminTeamForm from "@/pages/admin/AdminTeamForm";

export const Route = createFileRoute("/admin/team/$id/edit")({
  component: AdminTeamForm,
});
