import { createFileRoute } from "@tanstack/react-router";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});
