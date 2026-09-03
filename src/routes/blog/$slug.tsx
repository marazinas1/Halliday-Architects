import { createFileRoute } from "@tanstack/react-router";
import BlogPostPage from "@/pages/BlogPostPage";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});
