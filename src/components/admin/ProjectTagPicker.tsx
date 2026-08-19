import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useTags } from "@/hooks/admin/useTags";

/** Tags attached to the project itself — used for filtering on /projects. */
export default function ProjectTagPicker({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data: tags = [] } = useTags();
  const { data: assigned = [] } = useQuery({
    queryKey: ["project-tags", projectId],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("project_tags")
        .select("tag_id")
        .eq("project_id", projectId);
      if (error) throw error;
      return (data ?? []).map((r) => r.tag_id);
    },
  });

  const toggle = async (tagId: string, on: boolean) => {
    const { error } = on
      ? await supabase.from("project_tags").insert({ project_id: projectId, tag_id: tagId })
      : await supabase
          .from("project_tags")
          .delete()
          .eq("project_id", projectId)
          .eq("tag_id", tagId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["project-tags", projectId] });
    qc.invalidateQueries({ queryKey: ["public-projects"] });
  };

  if (!tags.length) {
    return <p className="text-sm text-stone">No tags yet — add some under Tags.</p>;
  }

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {tags.map((t) => (
        <label key={t.id} className="flex items-center gap-2 text-sm text-ink">
          <Checkbox
            checked={assigned.includes(t.id)}
            onCheckedChange={(v) => void toggle(t.id, v === true)}
          />
          {t.name}
        </label>
      ))}
    </div>
  );
}
