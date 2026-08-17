import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isValidSlug } from "@/lib/admin/slug";

/** Checks whether a slug is free (ignoring the project currently being edited). */
export function useSlugAvailability(slug: string, currentId?: string) {
  return useQuery({
    queryKey: ["slug-availability", slug, currentId ?? "new"],
    enabled: isValidSlug(slug),
    queryFn: async (): Promise<boolean> => {
      let q = supabase.from("projects").select("id").eq("slug", slug);
      if (currentId) q = q.neq("id", currentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).length === 0;
    },
  });
}
