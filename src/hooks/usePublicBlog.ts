import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBlogImageUrl } from "@/lib/admin/uploadBlogImage";

export type PublicPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  category: { id: string; name: string; slug: string } | null;
  published_at: string | null;
  created_at: string;
};

type Row = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_path: string | null;
  published_at: string | null;
  created_at: string;
  blog_categories: { id: string; name: string; slug: string } | null;
};

const SELECT =
  "id, title, slug, excerpt, body, cover_path, published_at, created_at, blog_categories(id, name, slug)";

function toPost(row: Row): PublicPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    cover_url: row.cover_path ? getBlogImageUrl(row.cover_path) : null,
    category: row.blog_categories,
    published_at: row.published_at,
    created_at: row.created_at,
  };
}

export const PUBLIC_BLOG_KEY = ["public-blog"];

/** Key a single post shares between its route loader and its hook. */
export const publicPostKey = (slug: string) => ["public-blog", slug];

/** Shared fetchers so route loaders and hooks agree exactly. */
export async function fetchPublishedPosts(): Promise<PublicPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as Row[]).map(toPost);
}

export async function fetchPublishedPost(slug: string): Promise<PublicPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? toPost(data as unknown as Row) : null;
}

export function usePublishedPosts() {
  return useQuery({
    queryKey: PUBLIC_BLOG_KEY,
    staleTime: 5 * 60_000,
    queryFn: fetchPublishedPosts,
  });
}

export function usePublishedPost(slug: string | undefined) {
  return useQuery({
    queryKey: publicPostKey(slug ?? ""),
    staleTime: 5 * 60_000,
    enabled: !!slug,
    queryFn: () => fetchPublishedPost(slug!),
  });
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
