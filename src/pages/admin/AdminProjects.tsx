import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router-compat";
import {
  Plus,
  Pencil,
  Search,
  Trash2,
  MoreVertical,
  Copy,
  ImageOff,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { useProjects, type ProjectListItem } from "@/hooks/admin/useProjects";
import { useUpdateProjectPublished } from "@/hooks/admin/useUpdateProjectPublished";
import { useDeleteProject } from "@/hooks/admin/useDeleteProject";
import { PROJECT_TYPES, PROJECT_TYPE_LABELS, type ProjectType } from "@/hooks/usePublicProjects";
import AdminProtected from "@/components/admin/AdminProtected";
import SectionTabs from "@/components/admin/SectionTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export const PROJECT_TABS = [
  { label: "Projects", to: "/admin/projects", match: (p: string) => p.startsWith("/admin/projects") },
  { label: "Tags", to: "/admin/tags", match: (p: string) => p.startsWith("/admin/tags") },
];

type ViewMode = "grid" | "table";
type StatusFilter = "all" | "published" | "draft";
type SortKey = "default" | "title-asc" | "newest" | "year-desc";

const VIEW_STORAGE_KEY = "admin-projects-view";

const typeLabel = (t: string) => PROJECT_TYPE_LABELS[t as ProjectType] ?? t;

function AdminProjectsInner() {
  const { data, isLoading } = useProjects();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const updatePublished = useUpdateProjectPublished();
  const deleteProject = useDeleteProject();

  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialStatus === "draft" || initialStatus === "published" ? initialStatus : "all",
  );
  const [sort, setSort] = useState<SortKey>("default");
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "grid" || saved === "table") setView(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const rows = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((p) => {
      if (q && !`${p.title} ${p.slug} ${p.location_city ?? ""}`.toLowerCase().includes(q))
        return false;
      if (typeFilter !== "all" && p.project_type !== typeFilter) return false;
      if (statusFilter === "published" && !p.published) return false;
      if (statusFilter === "draft" && p.published) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "newest":
          return b.updated_at.localeCompare(a.updated_at);
        case "year-desc":
          return (b.year_completed ?? 0) - (a.year_completed ?? 0);
        default:
          return a.sort_order - b.sort_order;
      }
    });
    return list;
  }, [rows, search, typeFilter, statusFilter, sort]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/projects/${slug}`);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const onTogglePublished = (id: string, published: boolean) =>
    updatePublished.mutate({ id, published });

  // The homepage always shows the first four published projects by sort_order.
  const homepageIds = useMemo(() => {
    const published = rows
      .filter((p) => p.published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, 4);
    return new Set(published.map((p) => p.id));
  }, [rows]);

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteProject.mutate(toDelete.id, {
      onSuccess: () => toast.success("Project deleted"),
      onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
      onSettled: () => setToDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <SectionTabs tabs={PROJECT_TABS} />
      <header className="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-ink">Projects</h1>
          <p className="text-sm text-stone">
            {rows.length} {rows.length === 1 ? "project" : "projects"} total
            {" · "}
            <span className="text-stone">
              The first four published projects appear on the homepage — reorder to change which.
            </span>
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/projects/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add new project</span>
          </Link>
        </Button>
      </header>

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug or city…"
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {PROJECT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {PROJECT_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-[190px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default order</SelectItem>
            <SelectItem value="title-asc">Title A–Z</SelectItem>
            <SelectItem value="newest">Recently updated</SelectItem>
            <SelectItem value="year-desc">Year completed ↓</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as ViewMode)}
          className="sm:ml-auto"
          variant="outline"
        >
          <ToggleGroupItem value="grid" aria-label="Card view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="List view">
            <ListIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-stone">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : view === "grid" ? (
        <GridView
          items={filtered}
          onDelete={setToDelete}
          onCopy={copyLink}
          onTogglePublished={onTogglePublished}
          homepageIds={homepageIds}
        />
      ) : (
        <TableView
          items={filtered}
          onDelete={setToDelete}
          onCopy={copyLink}
          onTogglePublished={onTogglePublished}
          homepageIds={homepageIds}
        />
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? `“${toDelete.title}” and all of its images will be permanently removed.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        published ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-stone",
      )}
    >
      {published ? "Published" : "Draft"}
    </Badge>
  );
}

/** Non-interactive indicator: this project is currently one of the homepage four. */
function HomepageBadge() {
  return (
    <Badge
      variant="secondary"
      className="border-transparent bg-ink/10 text-ink"
    >
      On homepage
    </Badge>
  );
}

function Thumb({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={cn("grid place-items-center bg-sand text-stone", className)}>
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={cn("object-cover", className)} loading="lazy" />;
}

type RowHandlers = {
  onDelete: (v: { id: string; title: string }) => void;
  onCopy: (slug: string) => void;
  onTogglePublished: (id: string, published: boolean) => void;
  homepageIds: Set<string>;
};

function RowActions({
  p,
  onDelete,
  onCopy,
}: { p: ProjectListItem } & Omit<RowHandlers, "onTogglePublished" | "homepageIds">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="More actions">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onCopy(p.slug)}>
          <Copy className="h-4 w-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer">
            <Pencil className="h-4 w-4" />
            View on site
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete({ id: p.id, title: p.title })}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GridView({
  items,
  onDelete,
  onCopy,
  onTogglePublished,
  homepageIds,
}: { items: ProjectListItem[] } & RowHandlers) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <Card key={p.id} className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
          <div className="relative">
            <Thumb src={p.card_image_url} alt={p.title} className="aspect-[4/3] w-full" />
            <div className="absolute left-3 top-3">
              <StatusBadge published={p.published} />
            </div>
            {homepageIds.has(p.id) ? (
              <div className="absolute right-3 top-3">
                <HomepageBadge />
              </div>
            ) : null}
          </div>
          <CardContent className="space-y-3 pt-4">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-ink">{p.title}</h3>
              <p className="truncate text-xs text-stone">/{p.slug}</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone">
              <span className="inline-flex items-center gap-1">{typeLabel(p.project_type)}</span>
              {p.location_city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {p.location_city}
                </span>
              ) : null}
              {p.year_completed ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {p.year_completed}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-sm text-stone">
              <Switch
                checked={p.published}
                onCheckedChange={(c) => onTogglePublished(p.id, c)}
                aria-label="Published"
              />
              <span>{p.published ? "Visible on site" : "Hidden"}</span>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2 border-t border-line pt-4">
            <Button asChild variant="secondary" size="sm" className="flex-1">
              <Link to={`/admin/projects/${p.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <RowActions p={p} onDelete={onDelete} onCopy={onCopy} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function TableView({
  items,
  onDelete,
  onCopy,
  onTogglePublished,
  homepageIds,
}: { items: ProjectListItem[] } & RowHandlers) {
  const navigate = useNavigate();
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Homepage</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <Thumb
                    src={p.card_image_url}
                    alt={p.title}
                    className="h-10 w-10 shrink-0 rounded-md"
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{p.title}</div>
                    <div className="truncate text-xs text-stone">/{p.slug}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-stone">{typeLabel(p.project_type)}</TableCell>
              <TableCell className="text-stone">{p.location_city || "—"}</TableCell>
              <TableCell className="text-stone">{p.year_completed ?? "—"}</TableCell>
              <TableCell className="text-stone">{p.sort_order}</TableCell>
              <TableCell>
                <Switch
                  checked={p.published}
                  onCheckedChange={(c) => onTogglePublished(p.id, c)}
                  aria-label="Published"
                />
              </TableCell>
              <TableCell>{homepageIds.has(p.id) ? <HomepageBadge /> : <span className="text-stone">—</span>}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => navigate(`/admin/projects/${p.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => onDelete({ id: p.id, title: p.title })}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <RowActions p={p} onDelete={onDelete} onCopy={onCopy} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-line bg-card p-10 text-center">
      <h3 className="text-lg font-semibold text-ink">No projects yet</h3>
      <p className="mt-1 text-sm text-stone">Add your first project to get started.</p>
      <Button asChild className="mt-4">
        <Link to="/admin/projects/new">
          <Plus className="h-4 w-4" />
          Add new project
        </Link>
      </Button>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-card p-10 text-center">
      <h3 className="text-lg font-semibold text-ink">No projects match your filters</h3>
      <p className="mt-1 text-sm text-stone">Try adjusting the search or filters.</p>
      <Button variant="outline" className="mt-4" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

export default function AdminProjects() {
  return (
    <AdminProtected>
      <AdminProjectsInner />
    </AdminProtected>
  );
}
