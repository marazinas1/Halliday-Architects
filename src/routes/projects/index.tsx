import { createFileRoute } from "@tanstack/react-router";
import ProjectsPage from "@/pages/ProjectsPage";
import { PAGE_CONTENT_KEY, fetchPageContent } from "@/hooks/usePageContent";
import { fetchPublicProjects } from "@/hooks/usePublicProjects";
import { SITE_SETTINGS_KEY, fetchSiteSettings } from "@/hooks/useSiteSettings";
import { TAGS_KEY, fetchTags } from "@/hooks/admin/useTags";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/projects/")({
  // Fetched on the server before the HTML is sent, so the grid is in the
  // markup the browser parses rather than requested after hydration.
  head: () =>
    pageHead({
      title: "Projects | Halliday Architects",
      description:
        "Residential architecture in and around Ocean City, New Jersey — new builds, renovations, additions and interiors.",
      path: "/projects",
    }),

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
      context.queryClient.ensureQueryData({
        queryKey: SITE_SETTINGS_KEY,
        queryFn: fetchSiteSettings,
        staleTime: 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: TAGS_KEY,
        queryFn: fetchTags,
      }),
    ]);
  },

  component: ProjectsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-32 text-center">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">No projects found.</div>
  ),
});
