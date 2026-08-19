import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Map of image id -> tag ids, for every image of one project. */
export function useImageTags(imageIds: string[]) {
  const key = [...imageIds].sort().join(",");
  return useQuery({
    queryKey: ["image-tags", key],
    enabled: imageIds.length > 0,
    queryFn: async (): Promise<Record<string, string[]>> => {
      const { data, error } = await supabase
        .from("image_tags")
        .select("image_id, tag_id")
        .in("image_id", imageIds);
      if (error) throw error;
      const map: Record<string, string[]> = {};
      for (const row of data ?? []) {
        (map[row.image_id] ??= []).push(row.tag_id);
      }
      return map;
    },
  });
}

/** Applies or removes one tag across a set of images in a single round trip. */
export async function setTagForImages(
  imageIds: string[],
  tagId: string,
  apply: boolean,
): Promise<void> {
  if (!imageIds.length) return;
  if (apply) {
    const { error } = await supabase
      .from("image_tags")
      .upsert(
        imageIds.map((image_id) => ({ image_id, tag_id: tagId })),
        { onConflict: "image_id,tag_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("image_tags")
      .delete()
      .eq("tag_id", tagId)
      .in("image_id", imageIds);
    if (error) throw error;
  }
}
