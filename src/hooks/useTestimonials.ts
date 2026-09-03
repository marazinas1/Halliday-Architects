import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Testimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_detail: string | null;
};

export const TESTIMONIALS_KEY = ["testimonials"];

/** Shared fetcher so route loaders and the hook agree exactly. */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote, author_name, author_detail")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Published testimonials only — the section hides itself when there are none. */
export function useTestimonials() {
  return useQuery({
    queryKey: TESTIMONIALS_KEY,
    staleTime: 60_000,
    queryFn: fetchTestimonials,
  });
}