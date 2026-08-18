import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_SETTINGS_KEY, type SiteSettingsRow } from "@/hooks/useSiteSettings";

export type SiteSettingsPatch = Partial<Omit<SiteSettingsRow, "id">>;

/** Writes the single site_settings row, creating it on first save. */
export function useSaveSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string | null;
      patch: SiteSettingsPatch;
    }) => {
      if (id) {
        const { error } = await supabase.from("site_settings").update(patch).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("site_settings").insert({ ...patch, singleton: true });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SITE_SETTINGS_KEY });
    },
  });
}
