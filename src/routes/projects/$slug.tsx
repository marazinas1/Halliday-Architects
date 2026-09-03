import { createFileRoute, notFound } from "@tanstack/react-router";
import ProjectPage from "@/pages/ProjectPage";
import { PAGE_CONTENT_KEY, fetchPageContent } from "@/hooks/usePageContent";
import {
  PROJECT_ORDER_KEY,
  fetchProjectOrder,
  fetchPublicProject,
  publicProjectKey,
} from "@/hooks/usePublicProjects";

export const Route = createFileRoute("/projects/$slug")({
  // Fetched on the server before the HTML is sent. The keys here are the exact
  // keys the page's hooks read, so the component reuses the primed cache.
  loader: async ({ context, params }) => {
    const [project] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: publicProjectKey(params.slug),
        queryFn: () => fetchPublicProject(params.slug),
        staleTime: 5 * 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: PROJECT_ORDER_KEY,
        queryFn: fetchProjectOrder,
        staleTime: 5 * 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: PAGE_CONTENT_KEY,
        queryFn: fetchPageContent,
        staleTime: 60_000,
      }),
    ]);
    if (!project) throw notFound();
  },
  component: ProjectPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-32 text-center">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">Project not found.</div>
  ),
});
