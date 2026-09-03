import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/homepage")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/home", replace: true });
  },
  component: () => null,
});
