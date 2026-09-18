import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Plus, Pencil, Trash2, FileText, Tags } from "lucide-react";
import AdminSection from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useAdminBlogPosts, useDeleteBlogPost, useUpdateBlogPublished,
  type AdminBlogPost,
} from "@/hooks/admin/useAdminBlog";
import { useBlogCategories } from "@/hooks/admin/useBlogCategories";
import { getBlogImageUrl } from "@/lib/admin/uploadBlogImage";
import { formatPostDate } from "@/hooks/usePublicBlog";

function AdminBlogInner() {
  const { data, isLoading } = useAdminBlogPosts();
  const { data: categories } = useBlogCategories();
  const setPublished = useUpdateBlogPublished();
  const remove = useDeleteBlogPost();
  const [pendingDelete, setPendingDelete] = useState<AdminBlogPost | null>(null);

  const rows = data ?? [];
  const categoryName = (id: string | null) =>
    categories?.find((c) => c.id === id)?.name ?? "—";

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const post = pendingDelete;
    setPendingDelete(null);
    remove.mutate(post, {
      onSuccess: () => toast.success(`"${post.title}" deleted`),
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Journal entries. A post only appears on the website once it is published.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Link to="/admin/blog/categories">
            <Button variant="outline">
              <Tags className="w-4 h-4 mr-2" />
              Categories
            </Button>
          </Link>
          <Link to="/admin/blog/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-16 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-6">No posts yet.</p>
          <Link to="/admin/blog/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Write the first post
            </Button>
          </Link>
        </div>
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {rows.map((row) => (
            <article key={row.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex min-w-0 gap-3 p-4">
                <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
                  {row.cover_path ? (
                    <img src={getBlogImageUrl(row.cover_path)} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="min-w-0 break-words font-medium text-foreground">{row.title}</h2>
                    <Badge variant={row.published ? "success" : "muted"}>
                      {row.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">/blog/{row.slug}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {categoryName(row.category_id)} · {formatPostDate(row.published_at ?? row.created_at)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-border p-3">
                <Switch
                  checked={row.published}
                  onCheckedChange={(checked) => setPublished.mutate({ post: row, published: checked })}
                  aria-label={`Publish ${row.title}`}
                />
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/admin/blog/${row.id}/edit`}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(row)} aria-label={`Delete ${row.title}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-24">Cover</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3 w-40">Category</th>
                <th className="text-left px-4 py-3 w-40">Date</th>
                <th className="text-left px-4 py-3 w-28">Published</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <div className="w-16 h-12 rounded-sm bg-muted flex items-center justify-center overflow-hidden">
                      {row.cover_path ? (
                        <img src={getBlogImageUrl(row.cover_path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground/60" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{row.title}</div>
                    <div className="text-xs text-muted-foreground">/blog/{row.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground/80">{categoryName(row.category_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatPostDate(row.published_at ?? row.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={row.published}
                        onCheckedChange={(checked) => setPublished.mutate({ post: row, published: checked })}
                        aria-label={`Publish ${row.title}`}
                      />
                      <Badge variant={row.published ? "success" : "muted"}>
                        {row.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link to={`/admin/blog/${row.id}/edit`} className="inline-block">
                      <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => setPendingDelete(row)} aria-label={`Delete ${row.title}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the post along with its cover and any images used in the body. This cannot be undone.
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

export default function AdminBlog() {
  return (
    <AdminSection>
      <AdminBlogInner />
    </AdminSection>
  );
}
