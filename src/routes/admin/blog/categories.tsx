import { createFileRoute } from "@tanstack/react-router";
import AdminBlogCategories from "@/pages/admin/AdminBlogCategories";

export const Route = createFileRoute("/admin/blog/categories")({
  component: AdminBlogCategories,
});
