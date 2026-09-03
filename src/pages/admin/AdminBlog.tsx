import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, FileText, Tags } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold text-ink">Blog</h1>
        <div className="flex items-center gap-2">
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
        <div className="text-stone py-16 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-line">
          <p className="text-stone mb-6">No posts yet.</p>
          <Link to="/admin/blog/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Write the first post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-line overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="bg-sand text-stone text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-24">Cover</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3 w-40">Category</th>
                <th className="text-left px-4 py-3 w-40">Date</th>
                <th className="text-left px-4 py-3 w-28">Published</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-sand">
                  <td className="px-4 py-3">
                    <div className="w-16 h-12 rounded-sm bg-sand flex items-center justify-center overflow-hidden">
                      {row.cover_path ? (
                        <img src={getBlogImageUrl(row.cover_path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <FileText className="w-4 h-4 text-stone/60" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{row.title}</div>
                    <div className="text-xs text-stone">/blog/{row.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{categoryName(row.category_id)}</td>
                  <td className="px-4 py-3 text-stone">
                    {formatPostDate(row.published_at ?? row.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={row.published}
                        onCheckedChange={(checked) => setPublished.mutate({ post: row, published: checked })}
                        aria-label={`Publish ${row.title}`}
                      />
                      <span className={`text-xs ${row.published ? "text-ink" : "text-stone"}`}>
                        {row.published ? "Live" : "Draft"}
                      </span>
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
    <AdminProtected>
      <AdminBlogInner />
    </AdminProtected>
  );
}
