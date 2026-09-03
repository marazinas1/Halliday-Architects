import { createFileRoute, notFound } from "@tanstack/react-router";
import ProjectPage from "@/pages/ProjectPage";
import { PAGE_CONTENT_KEY, fetchPageContent } from "@/hooks/usePageContent";
import {
  PROJECT_ORDER_KEY,
  fetchProjectOrder,
  fetchPublicProject,
  publicProjectKey,
} from "@/hooks/usePublicProjects";
import { SITE_SETTINGS_KEY, fetchSiteSettings } from "@/hooks/useSiteSettings";
import { pageHead } from "@/lib/seo";

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
      context.queryClient.ensureQueryData({
        queryKey: SITE_SETTINGS_KEY,
        queryFn: fetchSiteSettings,
        staleTime: 60_000,
      }),
    ]);
    if (!project) throw notFound();

    // Plain values only — this is what head() reads on the server.
    return {
      title: project.project.title,
      description:
        project.project.tagline ?? project.project.description ?? project.project.title,
      slug: project.project.slug,
      heroUrl: project.heroUrl,
    };
  },

  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          title: `${loaderData.title} | Halliday Architects`,
          description: loaderData.description,
          path: `/projects/${loaderData.slug}`,
          image: loaderData.heroUrl,
          type: "article",
        })
      : pageHead({
          title: "Project not found | Halliday Architects",
          description: "This project is no longer available. Browse the Halliday Architects portfolio.",
          path: "/projects",
          noindex: true,
        }),

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
