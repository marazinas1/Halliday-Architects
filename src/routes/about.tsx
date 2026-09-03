import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "@/pages/AboutPage";
import { PAGE_CONTENT_KEY, fetchPageContent } from "@/hooks/usePageContent";
import { fetchPublicProjects } from "@/hooks/usePublicProjects";
import { TEAM_MEMBERS_KEY, fetchTeamMembers } from "@/hooks/useTeamMembers";
import { TESTIMONIALS_KEY, fetchTestimonials } from "@/hooks/useTestimonials";

export const Route = createFileRoute("/about")({
  // Fetched on the server before the HTML is sent, so the roster and the
  // photostrip are in the markup rather than requested after hydration.
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
        queryKey: TEAM_MEMBERS_KEY,
        queryFn: fetchTeamMembers,
        staleTime: 5 * 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: TESTIMONIALS_KEY,
        queryFn: fetchTestimonials,
        staleTime: 60_000,
      }),
    ]);
  },
  component: AboutPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-32 text-center">
      {error.message}
    </div>
  ),
});
