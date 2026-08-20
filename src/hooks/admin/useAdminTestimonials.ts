import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TESTIMONIALS_KEY } from "@/hooks/useTestimonials";

export type AdminTestimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_detail: string | null;
  sort_order: number;
  published: boolean;
};

const KEY = ["admin-testimonials"];

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: TESTIMONIALS_KEY });
}

export function useAdminTestimonials() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<AdminTestimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, quote, author_name, author_detail, sort_order, published")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<AdminTestimonial> & { quote: string; author_name: string }) => {
      const payload = {
        quote: input.quote.trim(),
        author_name: input.author_name.trim(),
        author_detail: input.author_detail?.trim() || null,
        published: input.published ?? false,
        sort_order: input.sort_order ?? 0,
      };
      if (input.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from("testimonials")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateTestimonialPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("testimonials").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

/** Swaps sort_order between two testimonials. */
export function useReorderTestimonials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ a, b }: { a: AdminTestimonial; b: AdminTestimonial }) => {
      const { error: e1 } = await supabase
        .from("testimonials")
        .update({ sort_order: b.sort_order })
        .eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("testimonials")
        .update({ sort_order: a.sort_order })
        .eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}