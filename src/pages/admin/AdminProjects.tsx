import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Image as ImageIcon } from "lucide-react";
import { useProjects } from "@/hooks/admin/useProjects";
import { useUpdateProjectPublished } from "@/hooks/admin/useUpdateProjectPublished";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function AdminProjectsInner() {
  const { data, isLoading } = useProjects();
  const updatePublished = useUpdateProjectPublished();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const rows = data ?? [];
    if (!search) return rows;
    return rows.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
        <Link to="/admin/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Project
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {isLoading ? (
        <div className="text-slate-500 py-16 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 mb-6">
            {(data ?? []).length === 0
              ? "No projects yet. Create your first one."
              : "No projects match your search."}
          </p>
          {(data ?? []).length === 0 && (
            <Link to="/admin/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Project
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-20">Image</th>
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="w-14 h-14 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                      {row.card_image_url ? (
                        <img
                          src={row.card_image_url}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{row.title}</div>
                    <div className="text-xs text-slate-500">/{row.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.sort_order}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={row.published}
                      onCheckedChange={(checked) =>
                        updatePublished.mutate({ id: row.id, published: checked })
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/projects/${row.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
