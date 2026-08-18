import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, Check, Pencil, X } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useBlogCategories, useDeleteBlogCategory, useReorderBlogCategories,
  useSaveBlogCategory, type BlogCategory,
} from "@/hooks/admin/useBlogCategories";
import { slugify } from "@/lib/admin/slug";

function AdminBlogCategoriesInner() {
  const { data, isLoading } = useBlogCategories();
  const save = useSaveBlogCategory();
  const reorder = useReorderBlogCategories();
  const remove = useDeleteBlogCategory();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<BlogCategory | null>(null);

  const rows = data ?? [];

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const slug = slugify(name);
    if (!slug) {
      toast.error("That name cannot be turned into a URL");
      return;
    }
    save.mutate(
      { name, slug, sort_order: rows.length },
      {
        onSuccess: () => {
          setNewName("");
          toast.success("Category added");
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const commitRename = (row: BlogCategory) => {
    const name = editingName.trim();
    if (!name) return;
    save.mutate(
      { id: row.id, name, slug: slugify(name) },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success("Category renamed");
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const a = rows[index];
    const b = rows[index + direction];
    if (!a || !b) return;
    reorder.mutate({ a, b });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Blog
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Categories</h1>
      </div>

      <div className="bg-card rounded-lg border border-line p-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wider text-stone" htmlFor="new-category">
            New category
          </label>
          <Input
            id="new-category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. Coastal detailing"
            className="mt-1"
          />
        </div>
        <Button onClick={add} disabled={save.isPending || !newName.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="text-stone py-16 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-line text-stone">
          No categories yet. Posts can still be published without one.
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-line divide-y divide-line">
          {rows.map((row, i) => (
            <div key={row.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={i === 0 || reorder.isPending} onClick={() => move(i, -1)} aria-label={`Move ${row.name} up`}>
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={i === rows.length - 1 || reorder.isPending} onClick={() => move(i, 1)} aria-label={`Move ${row.name} down`}>
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
              </div>

              {editingId === row.id ? (
                <>
                  <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1" autoFocus />
                  <Button size="icon" className="h-8 w-8" onClick={() => commitRename(row)} aria-label="Save name">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)} aria-label="Cancel">
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="text-ink font-medium">{row.name}</div>
                    <div className="text-xs text-stone">{row.slug}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setEditingId(row.id); setEditingName(row.name); }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Rename
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPendingDelete(row)} aria-label={`Delete ${row.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Posts in this category are kept — they simply lose their category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const cat = pendingDelete;
                setPendingDelete(null);
                if (!cat) return;
                remove.mutate(cat.id, {
                  onSuccess: () => toast.success("Category deleted"),
                  onError: (e) => toast.error((e as Error).message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminBlogCategories() {
  return (
    <AdminProtected>
      <AdminBlogCategoriesInner />
    </AdminProtected>
  );
}
