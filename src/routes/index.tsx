import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { PAGE_CONTENT_KEY, fetchPageContent } from "@/hooks/usePageContent";
import { fetchPublicProjects } from "@/hooks/usePublicProjects";

export const Route = createFileRoute("/")({
  // Fetched on the server before the HTML is sent, so the photographs are in
  // the markup the browser parses rather than requested after hydration.
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: PAGE_CONTENT_KEY,
        queryFn: fetchPageContent,
        staleTime: 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["public-projects"],
        queryFn: fetchPublicProjects,
        staleTime: 5 * 60_000,
      }),
    ]);
  },
  component: Index,
});
