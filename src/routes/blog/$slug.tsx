import { createFileRoute } from "@tanstack/react-router";
import BlogPostPage from "@/pages/BlogPostPage";
import {
  PUBLIC_BLOG_KEY,
  fetchPublishedPost,
  fetchPublishedPosts,
  publicPostKey,
} from "@/hooks/usePublicBlog";
import { SITE_SETTINGS_KEY, fetchSiteSettings } from "@/hooks/useSiteSettings";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  // Fetched on the server before the HTML is sent, using the exact same cache
  // keys the components read, so the article is in the markup on first paint.
  loader: async ({ context, params }) => {
    const [post] = await Promise.all([
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

    // Plain values only — this is what head() reads on the server.
    return post
      ? {
          title: post.title,
          description:
            post.excerpt ?? `${post.title} — from the Halliday Architects journal.`,
          slug: post.slug,
          coverUrl: post.cover_url,
        }
      : null;
  },

  head: ({ loaderData, params }) =>
    loaderData
      ? pageHead({
          title: `${loaderData.title} | Halliday Architects`,
          description: loaderData.description,
          path: `/blog/${loaderData.slug}`,
          image: loaderData.coverUrl,
          type: "article",
        })
      : pageHead({
          title: "Post not found | Halliday Architects",
          description: "This journal entry could not be found.",
          path: `/blog/${params.slug}`,
          noindex: true,
        }),

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
