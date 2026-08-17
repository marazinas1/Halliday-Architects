import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-project", id],
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      if (!id) throw new Error("no id");
      const { data: project, error: projErr } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (projErr) throw projErr;
      const { data: images, error: imgErr } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", id)
        .order("sort_order", { ascending: true });
      if (imgErr) throw imgErr;
      return { project, images: images ?? [] };
    },
  });
}
