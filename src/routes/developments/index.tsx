import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/developments/")({
  beforeLoad: () => {
    throw redirect({ to: "/projects", replace: true });
  },
  component: () => null,
});
