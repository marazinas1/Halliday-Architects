import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

const KEY = ["blog-categories"];

export function useBlogCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<BlogCategory[]> => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name: string; slug: string; sort_order?: number }) => {
      if (input.id) {
        const { error } = await supabase
          .from("blog_categories")
          .update({ name: input.name, slug: input.slug })
          .eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from("blog_categories")
        .insert({ name: input.name, slug: input.slug, sort_order: input.sort_order ?? 0 })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useReorderBlogCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ a, b }: { a: BlogCategory; b: BlogCategory }) => {
      const { error: e1 } = await supabase
        .from("blog_categories")
        .update({ sort_order: b.sort_order })
        .eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("blog_categories")
        .update({ sort_order: a.sort_order })
        .eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
    },
  });
}
