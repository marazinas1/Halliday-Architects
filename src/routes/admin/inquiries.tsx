import { createFileRoute } from "@tanstack/react-router";
import AdminInquiries from "@/pages/admin/AdminInquiries";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiries,
});
