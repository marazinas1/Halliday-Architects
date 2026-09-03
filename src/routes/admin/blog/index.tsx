import { createFileRoute } from "@tanstack/react-router";
import AdminBlog from "@/pages/admin/AdminBlog";

export const Route = createFileRoute("/admin/blog/")({
  component: AdminBlog,
});
