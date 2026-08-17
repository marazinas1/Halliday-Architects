import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { deleteStorageObjects, wipeProjectFolder } from "@/lib/admin/imageUpload";

/**
 * Deletes a project: removes its storage objects first (rows are the source of
 * truth for what to delete), then the images rows, then the project row.
 */
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: project, error } = await supabase
        .from("projects")
        .select("slug")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;

      const { data: images, error: imgErr } = await supabase
        .from("project_images")
        .select("storage_path")
        .eq("project_id", id);
      if (imgErr) throw imgErr;

      const paths = (images ?? []).map((i) => i.storage_path);
      if (paths.length) await deleteStorageObjects(paths);
      if (project?.slug) await wipeProjectFolder(project.slug);

      const { error: delErr } = await supabase.from("projects").delete().eq("id", id);
      if (delErr) throw delErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["public-projects"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
    },
  });
}
