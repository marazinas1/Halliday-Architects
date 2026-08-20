import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  project_type: string | null;
  timeline: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
  read_at: string | null;
  archived_at: string | null;
  notified_at: string | null;
  notify_error: string | null;
};

export type InquiryFilter = "unread" | "all" | "archived";

const COLUMNS =
  "id, name, email, phone, interest, project_type, timeline, message, source, created_at, read_at, archived_at, notified_at, notify_error";

export const INQUIRIES_KEY = ["admin", "inquiries"] as const;
export const INQUIRIES_UNREAD_KEY = ["admin", "inquiries", "unread-count"] as const;

export function useInquiries(filter: InquiryFilter, search: string) {
  return useQuery({
    queryKey: [...INQUIRIES_KEY, filter, search.trim().toLowerCase()],
    queryFn: async (): Promise<Inquiry[]> => {
      let query = supabase.from("leads").select(COLUMNS).order("created_at", { ascending: false });

      if (filter === "archived") query = query.not("archived_at", "is", null);
      else query = query.is("archived_at", null);
      if (filter === "unread") query = query.is("read_at", null);

      const term = search.trim();
      if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    },
  });
}

/** Unread and not archived — the number shown on the sidebar badge. */
export function useUnreadInquiryCount(enabled = true) {
  return useQuery({
    queryKey: INQUIRIES_UNREAD_KEY,
    enabled,
    staleTime: 30_000,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .is("archived_at", null)
        .is("read_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

type Patch = Partial<Pick<Inquiry, "read_at" | "archived_at">>;

export function useUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Patch }) => {
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INQUIRIES_KEY });
      qc.invalidateQueries({ queryKey: INQUIRIES_UNREAD_KEY });
    },
  });
}