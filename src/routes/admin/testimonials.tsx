import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/testimonials")({
  beforeLoad: () => {
    throw redirect({ href: "/admin/about?tab=testimonials", replace: true });
  },
  component: () => null,
});
