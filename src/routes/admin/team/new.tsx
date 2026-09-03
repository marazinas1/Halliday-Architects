import { createFileRoute } from "@tanstack/react-router";
import AdminTeamForm from "@/pages/admin/AdminTeamForm";

export const Route = createFileRoute("/admin/team/new")({
  component: AdminTeamForm,
});
