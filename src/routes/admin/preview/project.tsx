import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "@/pages/ProjectPage";

export const Route = createFileRoute("/admin/preview/project")({
  component: ProjectPage,
});
