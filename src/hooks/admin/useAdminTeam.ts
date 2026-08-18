import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { deleteTeamPhoto } from "@/lib/admin/uploadTeamPhoto";

export type AdminTeamMember = {
  id: string;
  name: string;
  role: string;
  credentials: string | null;
  bio: string | null;
  photo_path: string | null;
  sort_order: number;
  published: boolean;
};

const KEY = ["admin-team"];

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: ["team-members"] });
}

export function useAdminTeam() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<AdminTeamMember[]> => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, role, credentials, bio, photo_path, sort_order, published")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-team", id],
    enabled: !!id,
    queryFn: async (): Promise<AdminTeamMember | null> => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, role, credentials, bio, photo_path, sort_order, published")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<AdminTeamMember> & { name: string }) => {
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase.from("team_members").update(rest).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("team_members")
        .insert({
          name: input.name,
          role: input.role ?? "",
          credentials: input.credentials ?? null,
          bio: input.bio ?? null,
          photo_path: input.photo_path ?? null,
          sort_order: input.sort_order ?? 0,
          published: input.published ?? true,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateTeamPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("team_members").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

/** Swaps sort_order between two members. */
export function useReorderTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ a, b }: { a: AdminTeamMember; b: AdminTeamMember }) => {
      const { error: e1 } = await supabase
        .from("team_members")
        .update({ sort_order: b.sort_order })
        .eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("team_members")
        .update({ sort_order: a.sort_order })
        .eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => invalidate(qc),
  });
}

/**
 * Deletes a member. The stored photo is removed FIRST — if storage fails we
 * abort rather than leave an orphaned file behind.
 */
export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: AdminTeamMember) => {
      await deleteTeamPhoto(member.photo_path);
      const { error } = await supabase.from("team_members").delete().eq("id", member.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}
