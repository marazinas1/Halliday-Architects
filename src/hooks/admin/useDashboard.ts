import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dashboard data. Owner-only queries are gated by `enabled` so an editor's
 * session never issues a request for inquiries or team members.
 */

export type ContentCounts = {
  publishedProjects: number;
  draftProjects: number;
  publishedPosts: number;
  draftPosts: number;
};

type CountTable = "projects" | "blog_posts" | "team_members";

/** `head: true` count query — returns the number only, never the rows. */
async function countRows(
  table: CountTable,
  column?: "published",
  value?: boolean,
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true }) as any;
  if (column) query = query.eq(column, value);
  const { count, error } = await query;
  if (error) throw error;
  return (count as number | null) ?? 0;
}

export function useContentCounts() {
  return useQuery({
    queryKey: ["admin", "dashboard", "counts"],
    staleTime: 30_000,
    queryFn: async (): Promise<ContentCounts> => {
      const [publishedProjects, draftProjects, publishedPosts, draftPosts] =
        await Promise.all([
          countRows("projects", "published", true),
          countRows("projects", "published", false),
          countRows("blog_posts", "published", true),
          countRows("blog_posts", "published", false),
        ]);
      return { publishedProjects, draftProjects, publishedPosts, draftPosts };
    },
  });
}

export function useTeamCount(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "dashboard", "team-count"],
    enabled,
    staleTime: 30_000,
    queryFn: () => countRows("team_members"),
  });
}

export type ActivityKind = "project" | "post" | "team";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  href: string;
  at: string;
  created: boolean;
};

/** Last edits across projects, posts and — for owners only — team members. */
export function useRecentActivity(includeTeam: boolean, limit = 6) {
  return useQuery({
    queryKey: ["admin", "dashboard", "activity", includeTeam, limit],
    staleTime: 30_000,
    queryFn: async (): Promise<ActivityItem[]> => {
      const items: ActivityItem[] = [];

      const [projects, posts] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(limit),
        supabase
          .from("blog_posts")
          .select("id, title, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(limit),
      ]);
      if (projects.error) throw projects.error;
      if (posts.error) throw posts.error;

      for (const p of projects.data ?? []) {
        items.push({
          id: p.id,
          kind: "project",
          title: p.title,
          href: `/admin/projects/${p.id}/edit`,
          at: p.updated_at ?? p.created_at,
          created: sameMoment(p.created_at, p.updated_at),
        });
      }
      for (const p of posts.data ?? []) {
        items.push({
          id: p.id,
          kind: "post",
          title: p.title,
          href: `/admin/blog/${p.id}/edit`,
          at: p.updated_at ?? p.created_at,
          created: sameMoment(p.created_at, p.updated_at),
        });
      }

      if (includeTeam) {
        const { data, error } = await supabase
          .from("team_members")
          .select("id, name, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        for (const m of data ?? []) {
          items.push({
            id: m.id,
            kind: "team",
            title: m.name,
            href: `/admin/team/${m.id}/edit`,
            at: m.updated_at ?? m.created_at,
            created: sameMoment(m.created_at, m.updated_at),
          });
        }
      }

      return items
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, limit);
    },
  });
}

/** A row untouched since insert reads as "created" rather than "edited". */
function sameMoment(created: string | null, updated: string | null) {
  if (!created || !updated) return true;
  return Math.abs(new Date(updated).getTime() - new Date(created).getTime()) < 2000;
}

export function relativeTime(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
