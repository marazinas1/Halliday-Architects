import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery")({
  beforeLoad: () => {
    throw redirect({ to: "/projects", replace: true });
  },
  component: () => null,
});
