import { createFileRoute } from "@tanstack/react-router";
import AdminPhotographs from "@/pages/admin/AdminPhotographs";

export const Route = createFileRoute("/admin/photographs")({
  component: AdminPhotographs,
});
