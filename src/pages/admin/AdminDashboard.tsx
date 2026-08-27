import { Link } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  FolderOpen,
  Inbox,
  Plus,
  Users,
} from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { isOwnerRole, useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useUnreadInquiryCount } from "@/hooks/admin/useInquiries";
import { useAnalytics } from "@/hooks/admin/useAnalytics";
import {
  relativeTime,
  useContentCounts,
  useRecentActivity,
  useTeamCount,
  type ActivityKind,
} from "@/hooks/admin/useDashboard";

const KIND_LABEL: Record<ActivityKind, string> = {
  project: "Project",
  post: "Post",
  team: "Team",
};

const KIND_ICON: Record<ActivityKind, typeof FolderOpen> = {
  project: FolderOpen,
  post: FileText,
  team: Users,
};

function Stat({ value, label, note, to }: { value: number; label: string; note?: string; to: string }) {
  return (
    <Link to={to} className="group block">
      <span className="block text-4xl font-light tabular-nums text-ink transition-opacity group-hover:opacity-60">
        {value}
      </span>
      <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-stone">{label}</span>
      {note && <span className="mt-1 block text-xs text-stone/80">{note}</span>}
    </Link>
  );
}

function AttentionRow({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0"
    >
      <span className="text-sm text-ink">{children}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-stone transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function AdminDashboardInner() {
  const auth = useAdminAuth();
  const owner = auth.status === "authorized" && isOwnerRole(auth.role);

  const { data: counts } = useContentCounts();
  const { data: unread = 0 } = useUnreadInquiryCount(owner);
  const { data: teamCount } = useTeamCount(owner);
  const { data: activity = [] } = useRecentActivity(owner);
  const { data: traffic } = useAnalytics(7, owner);

  const draftProjects = counts?.draftProjects ?? 0;
  const draftPosts = counts?.draftPosts ?? 0;
  const waiting = (owner && unread > 0) || draftProjects > 0 || draftPosts > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-stone">
          Projects now live under{" "}
          <Link to="/admin/projects" className="text-ink underline underline-offset-4">
            Projects
          </Link>{" "}
          in the sidebar.
        </p>
      </header>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Needs attention</h2>
        <div className="mt-4">
          {waiting ? (
            <div className="rounded-lg border border-line bg-card px-6">
              {owner && unread > 0 && (
                <AttentionRow to="/admin/inquiries">
                  {unread} unread {unread === 1 ? "inquiry" : "inquiries"}
                </AttentionRow>
              )}
              {draftProjects > 0 && (
                <AttentionRow to="/admin/projects?status=draft">
                  {draftProjects} unpublished {draftProjects === 1 ? "project" : "projects"}
                </AttentionRow>
              )}
              {draftPosts > 0 && (
                <AttentionRow to="/admin/blog">
                  {draftPosts} unpublished blog {draftPosts === 1 ? "draft" : "drafts"}
                </AttentionRow>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone">
              Nothing waiting. Everything is published{owner ? " and read" : ""}.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Content</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <Stat
            value={counts?.publishedProjects ?? 0}
            label="Published projects"
            to="/admin/projects"
          />
          <Stat value={counts?.draftProjects ?? 0} label="Draft projects" to="/admin/projects?status=draft" />
          <Stat value={counts?.publishedPosts ?? 0} label="Published posts" to="/admin/blog" />
          {owner && <Stat value={teamCount ?? 0} label="Team members" to="/admin/team" />}
        </div>
      </section>

      {owner && (
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Traffic</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            <Stat
              value={Number(traffic?.totals?.views ?? 0)}
              label="Views this week"
              to="/admin/analytics"
            />
            <Stat
              value={Number(traffic?.totals?.visitors ?? 0)}
              label="Visitors this week"
              to="/admin/analytics"
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Recent activity</h2>
        <div className="mt-4 rounded-lg border border-line bg-card px-6">
          {activity.length === 0 ? (
            <p className="py-6 text-sm text-stone">Nothing edited yet.</p>
          ) : (
            activity.map((item) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <Link
                  key={`${item.kind}-${item.id}`}
                  to={item.href}
                  className="group flex items-center gap-4 border-b border-line py-4 last:border-b-0"
                >
                  <Icon className="h-4 w-4 shrink-0 text-stone" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink group-hover:underline underline-offset-4">
                    {item.title}
                  </span>
                  <span className="hidden text-xs text-stone sm:block">{KIND_LABEL[item.kind]}</span>
                  <span className="w-28 shrink-0 text-right text-xs text-stone">
                    {item.created ? "Created" : "Edited"} {relativeTime(item.at)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-stone">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/projects/new">
              <Plus className="h-4 w-4" />
              Add a project
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/blog/new">
              <FileText className="h-4 w-4" />
              Write a post
            </Link>
          </Button>
          {owner && (
            <Button asChild variant="outline">
              <Link to="/admin/inquiries">
                <Inbox className="h-4 w-4" />
                Inquiries
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View the live site
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtected>
      <AdminDashboardInner />
    </AdminProtected>
  );
}
