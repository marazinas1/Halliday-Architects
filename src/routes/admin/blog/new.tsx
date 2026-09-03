import { createFileRoute } from "@tanstack/react-router";
import AdminBlogForm from "@/pages/admin/AdminBlogForm";

export const Route = createFileRoute("/admin/blog/new")({
  component: AdminBlogForm,
});
