import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/pages/ContactPage";
import { PAGE_CONTENT_KEY, fetchPageContent } from "@/hooks/usePageContent";
import { fetchPublicProjects } from "@/hooks/usePublicProjects";
import { SITE_SETTINGS_KEY, fetchSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/contact")({
  // Fetched on the server before the HTML is sent, so the hero photograph is
  // in the markup rather than requested after hydration.
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
    ]);
  },
  component: ContactPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-32 text-center">
      {error.message}
    </div>
  ),
});
