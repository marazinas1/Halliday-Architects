import { createFileRoute } from "@tanstack/react-router";
import TeamMemberPreview from "@/pages/admin/TeamMemberPreview";

export const Route = createFileRoute("/admin/preview/team")({
  component: TeamMemberPreview,
});
