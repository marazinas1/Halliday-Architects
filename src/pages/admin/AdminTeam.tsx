import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, User } from "lucide-react";
import AdminSection from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import {
  useAdminTeam,
  useDeleteTeamMember,
  useReorderTeam,
  useUpdateTeamPublished,
  type AdminTeamMember,
} from "@/hooks/admin/useAdminTeam";
import { getTeamPhotoUrl } from "@/lib/admin/uploadTeamPhoto";

export function TeamManager({ embedded = false }: { embedded?: boolean }) {
  const { data, isLoading } = useAdminTeam();
  const updatePublished = useUpdateTeamPublished();
  const reorder = useReorderTeam();
  const remove = useDeleteTeamMember();
  const [pendingDelete, setPendingDelete] = useState<AdminTeamMember | null>(null);

  const rows = data ?? [];

  const move = (index: number, direction: -1 | 1) => {
    const a = rows[index];
    const b = rows[index + direction];
    if (!a || !b) return;
    reorder.mutate({ a, b });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const member = pendingDelete;
    setPendingDelete(null);
    remove.mutate(member, {
      onSuccess: () => toast.success(`${member.name} removed`),
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={embedded ? "text-lg font-medium text-foreground" : "text-2xl font-semibold text-foreground"}>Team</h2>
        <Link to="/admin/team/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">Published team members appear in the Studio section of the About page.</p>

      {isLoading ? (
        <div className="text-muted-foreground py-16 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-6">No team members yet.</p>
          <Link to="/admin/team/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 md:hidden">
          {rows.map((row, i) => (
            <article key={row.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex min-w-0 gap-3 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
                  {row.photo_path ? (
                    <img src={getTeamPhotoUrl(row.photo_path)} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-medium text-foreground">{row.name}</h3>
                    <Badge variant={row.published ? "success" : "muted"}>
                      {row.published ? "Shown" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80">{row.role}</p>
                  {row.credentials && <p className="text-xs text-muted-foreground">{row.credentials}</p>}
                </div>
              </div>
              <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-1 border-t border-border p-2">
                <Button variant="ghost" size="icon" disabled={i === 0 || reorder.isPending} onClick={() => move(i, -1)} aria-label={`Move ${row.name} up`}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled={i === rows.length - 1 || reorder.isPending} onClick={() => move(i, 1)} aria-label={`Move ${row.name} down`}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/admin/team/${row.id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(row)} aria-label={`Delete ${row.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-20">Photo</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3 w-28">Order</th>
                <th className="text-left px-4 py-3 w-24">Published</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => (
                <tr key={row.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <div className="w-14 h-14 rounded-sm bg-muted flex items-center justify-center overflow-hidden">
                      {row.photo_path ? (
                        <img
                          src={getTeamPhotoUrl(row.photo_path)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground/60" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{row.name}</div>
                    {row.credentials && (
                      <div className="text-xs text-muted-foreground">{row.credentials}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">{row.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={i === 0 || reorder.isPending}
                        onClick={() => move(i, -1)}
                        aria-label={`Move ${row.name} up`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={i === rows.length - 1 || reorder.isPending}
                        onClick={() => move(i, 1)}
                        aria-label={`Move ${row.name} down`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={row.published}
                        onCheckedChange={(checked) =>
                          updatePublished.mutate({ id: row.id, published: checked })
                        }
                        aria-label={`Show ${row.name} on the site`}
                      />
                      <Badge variant={row.published ? "success" : "muted"}>
                        {row.published ? "Shown" : "Hidden"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link to={`/admin/team/${row.id}/edit`} className="inline-block">
                      <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingDelete(row)}
                      aria-label={`Delete ${row.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the person and their photo permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminTeam() {
  return (
    <AdminSection access="owner">
      <TeamManager />
    </AdminSection>
  );
}
