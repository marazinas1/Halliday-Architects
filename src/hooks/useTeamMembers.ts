import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTeamPhotoUrl } from "@/lib/admin/uploadTeamPhoto";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  credentials: string | null;
  bio: string | null;
  photo_url: string | null;
};

/** Published team members for the public site, in display order. */
export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, role, credentials, bio, photo_path")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        credentials: m.credentials,
        bio: m.bio,
        photo_url: m.photo_path ? getTeamPhotoUrl(m.photo_path) : null,
      }));
    },
  });
}
