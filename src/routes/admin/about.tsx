import { createFileRoute } from "@tanstack/react-router";
import AdminAbout from "@/pages/admin/AdminAbout";

export const Route = createFileRoute("/admin/about")({
  component: AdminAbout,
});
