import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/team/")({
  beforeLoad: () => {
    throw redirect({ href: "/admin/about?tab=team", replace: true });
  },
  component: () => null,
});
