import { createFileRoute } from "@tanstack/react-router";
import AdminTags from "@/pages/admin/AdminTags";

export const Route = createFileRoute("/admin/tags")({
  component: AdminTags,
});
