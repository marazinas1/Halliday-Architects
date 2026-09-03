import { createFileRoute } from "@tanstack/react-router";
import BlogPage from "@/pages/BlogPage";
import { PUBLIC_BLOG_KEY, fetchPublishedPosts } from "@/hooks/usePublicBlog";
import { PAGE_CONTENT_KEY, fetchPageContent } from "@/hooks/usePageContent";
import { SITE_SETTINGS_KEY, fetchSiteSettings } from "@/hooks/useSiteSettings";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  // Fetched on the server before the HTML is sent, so the journal list is in
  // the markup rather than requested after hydration.
  head: () =>
    pageHead({
      title: "Journal | Halliday Architects",
      description:
        "Notes on residential architecture, coastal building and design detail from Halliday Architects in Ocean City, NJ.",
      path: "/blog",
    }),

  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: PUBLIC_BLOG_KEY,
        queryFn: fetchPublishedPosts,
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
  },
  component: BlogPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-32 text-center">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">No posts yet.</div>
  ),
});
