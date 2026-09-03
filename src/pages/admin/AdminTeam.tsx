import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, User } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <h2 className={embedded ? "text-lg font-medium text-ink" : "text-2xl font-semibold text-ink"}>Team</h2>
        <Link to="/admin/team/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </Link>
      </div>
      <p className="text-sm text-stone">Published team members appear in the Studio section of the About page.</p>

      {isLoading ? (
        <div className="text-stone py-16 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-line">
          <p className="text-stone mb-6">No team members yet.</p>
          <Link to="/admin/team/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-line overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-sand text-stone text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-20">Photo</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3 w-28">Order</th>
                <th className="text-left px-4 py-3 w-24">Published</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, i) => (
                <tr key={row.id} className="hover:bg-sand">
                  <td className="px-4 py-3">
                    <div className="w-14 h-14 rounded-sm bg-sand flex items-center justify-center overflow-hidden">
                      {row.photo_path ? (
                        <img
                          src={getTeamPhotoUrl(row.photo_path)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <User className="w-5 h-5 text-stone/60" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{row.name}</div>
                    {row.credentials && (
                      <div className="text-xs text-stone">{row.credentials}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/80">{row.role}</td>
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
                    <Switch
                      checked={row.published}
                      onCheckedChange={(checked) =>
                        updatePublished.mutate({ id: row.id, published: checked })
                      }
                    />
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
    <AdminProtected access="owner">
      <TeamManager />
    </AdminProtected>
  );
}
