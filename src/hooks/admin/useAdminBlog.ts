import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteBlogImages,
  extractBodyImagePaths,
} from "@/lib/admin/uploadBlogImage";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_path: string | null;
  category_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

const LIST_KEY = ["admin-blog"];

const SELECT =
  "id, title, slug, excerpt, body, cover_path, category_id, published, published_at, created_at";

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: LIST_KEY });
  qc.invalidateQueries({ queryKey: ["public-blog"] });
}

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: async (): Promise<AdminBlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(SELECT)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-blog", id],
    enabled: !!id,
    queryFn: async (): Promise<AdminBlogPost | null> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(SELECT)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** True when the slug is free (ignoring the post being edited). */
export function useBlogSlugAvailability(slug: string, currentId?: string) {
  return useQuery({
    queryKey: ["blog-slug-availability", slug, currentId ?? "new"],
    enabled: slug.length >= 2,
    queryFn: async (): Promise<boolean> => {
      let q = supabase.from("blog_posts").select("id").eq("slug", slug);
      if (currentId) q = q.neq("id", currentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).length === 0;
    },
  });
}

export type SavePostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_path: string | null;
  category_id: string | null;
  published: boolean;
};

/**
 * Saves a post and prunes storage. Images that were referenced by the
 * previously stored body but no longer appear in the incoming body are
 * deleted, so an image dropped from a draft never lingers in the bucket.
 */
export function useSaveBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SavePostInput) => {
      if (input.id) {
        const { data: previous, error: readError } = await supabase
          .from("blog_posts")
          .select("body, published, published_at")
          .eq("id", input.id)
          .maybeSingle();
        if (readError) throw readError;

        const publishedAt =
          input.published && !previous?.published_at
            ? new Date().toISOString()
            : (previous?.published_at ?? null);

        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt,
            body: input.body,
            cover_path: input.cover_path,
            category_id: input.category_id,
            published: input.published,
            published_at: publishedAt,
          })
          .eq("id", input.id);
        if (error) throw error;

        const before = extractBodyImagePaths(previous?.body);
        const after = new Set(extractBodyImagePaths(input.body));
        const orphaned = before.filter((p) => !after.has(p));
        if (orphaned.length) {
          // Best effort: the post is already saved, a failed cleanup must not
          // surface as a save error.
          await deleteBlogImages(orphaned).catch(() => undefined);
        }
        return input.id;
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          body: input.body,
          cover_path: input.cover_path,
          category_id: input.category_id,
          published: input.published,
          published_at: input.published ? new Date().toISOString() : null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateBlogPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ post, published }: { post: AdminBlogPost; published: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          published,
          published_at: published && !post.published_at ? new Date().toISOString() : post.published_at,
        })
        .eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

/** Deletes a post. Cover and body images go first so nothing is orphaned. */
export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: AdminBlogPost) => {
      const paths = [...extractBodyImagePaths(post.body)];
      if (post.cover_path) paths.push(post.cover_path);
      await deleteBlogImages(paths);
      const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}
