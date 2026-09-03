import { createFileRoute } from "@tanstack/react-router";
import BlogPostPage from "@/pages/BlogPostPage";
import {
  PUBLIC_BLOG_KEY,
  fetchPublishedPost,
  fetchPublishedPosts,
  publicPostKey,
} from "@/hooks/usePublicBlog";
import { SITE_SETTINGS_KEY, fetchSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/blog/$slug")({
  // Fetched on the server before the HTML is sent, using the exact same cache
  // keys the components read, so the article is in the markup on first paint.
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: publicPostKey(params.slug),
        queryFn: () => fetchPublishedPost(params.slug),
        staleTime: 5 * 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: PUBLIC_BLOG_KEY,
        queryFn: fetchPublishedPosts,
        staleTime: 5 * 60_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: SITE_SETTINGS_KEY,
        queryFn: fetchSiteSettings,
        staleTime: 60_000,
      }),
    ]);
  },
  component: BlogPostPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-6 py-32 text-center">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">Post not found.</div>
  ),
});
