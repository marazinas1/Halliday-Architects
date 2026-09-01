import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SERVICES_KEY = ["services"];

export type ServiceRow = {
  id: string;
  title: string;
  body: string;
  includes: string[];
  icon: string | null;
  image_bucket: string | null;
  image_path: string | null;
  sort_order: number;
  published: boolean;
};

export type PublicService = ServiceRow & { imageUrl: string | null };

const SELECT =
  "id, title, body, includes, icon, image_bucket, image_path, sort_order, published";

function normalise(row: any): PublicService {
  const includes = Array.isArray(row.includes) ? (row.includes as string[]) : [];
  return {
    ...row,
    includes,
    imageUrl:
      row.image_bucket && row.image_path
        ? supabase.storage.from(row.image_bucket).getPublicUrl(row.image_path).data.publicUrl
        : null,
  };
}

/** Published service bands, in the order the client arranged them. */
export function useServices() {
  return useQuery({
    queryKey: SERVICES_KEY,
    staleTime: 60_000,
    queryFn: async (): Promise<PublicService[]> => {
      const { data, error } = await supabase
        .from("services")
        .select(SELECT)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(normalise);
    },
  });
}

/** Every service, published or not. Admin only. */
export function useAllServices() {
  return useQuery({
    queryKey: [...SERVICES_KEY, "all"],
    queryFn: async (): Promise<PublicService[]> => {
      const { data, error } = await supabase
        .from("services")
        .select(SELECT)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(normalise);
    },
  });
}
