import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin/slug";

export type Tag = { id: string; name: string; slug: string; sort_order: number };

export const TAGS_KEY = ["tags"] as const;

/** Standalone fetcher so route loaders can prime this query on the server. */
export async function fetchTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function useTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: fetchTags,
  });
}


const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["tags"] });
  qc.invalidateQueries({ queryKey: ["public-projects"] });
};

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<Tag> => {
      const clean = name.trim();
      if (!clean) throw new Error("Tag name is required");
      const { data: last } = await supabase
        .from("tags")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data, error } = await supabase
        .from("tags")
        .insert({ name: clean, slug: slugify(clean), sort_order: (last?.sort_order ?? 0) + 10 })
        .select("id, name, slug, sort_order")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useRenameTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const clean = name.trim();
      if (!clean) throw new Error("Tag name is required");
      const { error } = await supabase
        .from("tags")
        .update({ name: clean, slug: slugify(clean) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

/** Persists a new display order for the whole vocabulary. */
export function useReorderTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id, i) =>
          supabase
            .from("tags")
            .update({ sort_order: (i + 1) * 10 })
            .eq("id", id)
            .then(({ error }) => {
              if (error) throw error;
            }),
        ),
      );
    },
    onSuccess: () => invalidate(qc),
  });
}

/**
 * Deletes a tag. The join rows go with it (FK cascade); images and projects
 * are never touched.
 */
export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("image_tags").delete().eq("tag_id", id);
      await supabase.from("project_tags").delete().eq("tag_id", id);
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}
