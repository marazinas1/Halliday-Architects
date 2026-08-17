import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, X, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

import AdminProtected from "@/components/admin/AdminProtected";
import StringListEditor from "@/components/admin/StringListEditor";
import SpecsEditor, { SpecItem } from "@/components/admin/SpecsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/hooks/admin/useProject";
import { useSlugAvailability } from "@/hooks/admin/useSlugAvailability";
import { useDeleteProject } from "@/hooks/admin/useDeleteProject";
import {
  IMAGE_CATEGORIES,
  IMAGE_CATEGORY_LABELS,
  type ImageCategory,
  deleteStorageObjects,
  getPublicUrl,
  sweepProjectFolder,
  uploadImage,
} from "@/lib/admin/imageUpload";
import { isValidSlug, slugify } from "@/lib/admin/slug";

type ImageRow = {
  id?: string;
  category: ImageCategory;
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

const PROJECT_TYPES = ["new_build", "renovation", "interior", "addition"] as const;
type ProjectType = (typeof PROJECT_TYPES)[number];
const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  new_build: "New build",
  renovation: "Renovation",
  interior: "Interior",
  addition: "Addition",
};

type FormState = {
  slug: string;
  title: string;
  headline: string;
  tagline: string;
  description: string;
  location_city: string;
  location_state: string;
  project_type: ProjectType;
  year_completed: string;
  client_brief: string;
  story: string;
  sort_order: number;
  published: boolean;
  specs: SpecItem[];
  features: string[];
};

const emptyForm: FormState = {
  slug: "",
  title: "",
  headline: "",
  tagline: "",
  description: "",
  location_city: "Ocean City",
  location_state: "NJ",
  project_type: "new_build",
  year_completed: "",
  client_brief: "",
  story: "",
  sort_order: 0,
  published: false,
  specs: [],
  features: [],
};

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function AdminProjectFormInner() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useProject(id);
  const deleteProject = useDeleteProject();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const slugAvailable = useSlugAvailability(form.slug, id);

  useEffect(() => {
    if (!data) return;
    const p = data.project as Record<string, unknown>;
    setForm({
      slug: (p.slug as string) ?? "",
      title: (p.title as string) ?? "",
      headline: (p.headline as string) ?? "",
      tagline: (p.tagline as string) ?? "",
      description: (p.description as string) ?? "",
      location_city: (p.location_city as string) ?? "",
      location_state: (p.location_state as string) ?? "",
      project_type: (PROJECT_TYPES as readonly string[]).includes(p.project_type as string)
        ? (p.project_type as ProjectType)
        : "new_build",
      year_completed: p.year_completed != null ? String(p.year_completed) : "",
      client_brief: (p.client_brief as string) ?? "",
      story: (p.story as string) ?? "",
      sort_order: (p.sort_order as number) ?? 0,
      published: (p.published as boolean) ?? false,
      specs: asArray<SpecItem>(p.specs),
      features: asArray<string>(p.features),
    });
    setImages(
      data.images.map((img) => ({
        id: img.id,
        category: img.category as ImageCategory,
        storage_path: img.storage_path,
        alt_text: img.alt_text ?? "",
        sort_order: img.sort_order,
      })),
    );
  }, [data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const byCategory = useMemo(() => {
    const map: Record<ImageCategory, ImageRow[]> = { hero: [], card: [], gallery: [] };
    for (const img of images) map[img.category]?.push(img);
    for (const key of IMAGE_CATEGORIES) map[key].sort((a, b) => a.sort_order - b.sort_order);
    return map;
  }, [images]);

  const handleUpload = async (category: ImageCategory, files: FileList | null) => {
    if (!files?.length) return;
    if (!isValidSlug(form.slug)) {
      toast.error("Set a valid slug before uploading images.");
      return;
    }
    setUploading(true);
    try {
      const uploaded: ImageRow[] = [];
      let order = byCategory[category].length;
      for (const file of Array.from(files)) {
        const { storage_path } = await uploadImage({ file, category, slug: form.slug });
        uploaded.push({ category, storage_path, alt_text: "", sort_order: order++ });
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (img: ImageRow) => {
    setImages((prev) => prev.filter((i) => i.storage_path !== img.storage_path));
    setRemovedPaths((prev) => [...prev, img.storage_path]);
  };

  const moveImage = (img: ImageRow, dir: -1 | 1) => {
    const group = byCategory[img.category];
    const idx = group.findIndex((i) => i.storage_path === img.storage_path);
    const target = idx + dir;
    if (target < 0 || target >= group.length) return;
    const reordered = [...group];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const orderByPath = new Map(reordered.map((i, n) => [i.storage_path, n]));
    setImages((prev) =>
      prev.map((i) =>
        i.category === img.category
          ? { ...i, sort_order: orderByPath.get(i.storage_path) ?? i.sort_order }
          : i,
      ),
    );
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Project name is required");
    if (!isValidSlug(form.slug)) return toast.error("Slug is invalid");
    if (slugAvailable.data === false) return toast.error("Slug is already in use");

    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        headline: form.headline || null,
        tagline: form.tagline || null,
        description: form.description || null,
        location_city: form.location_city || null,
        location_state: form.location_state || null,
        project_type: form.project_type,
        year_completed: form.year_completed ? Number(form.year_completed) : null,
        client_brief: form.client_brief || null,
        story: form.story || null,
        sort_order: form.sort_order,
        published: form.published,
        specs: form.specs,
        features: form.features.filter((f) => f.trim()),
      };

      let projectId = id;
      if (isEdit) {
        const { error } = await supabase.from("projects").update(payload).eq("id", id!);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from("projects")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        projectId = created.id;
      }

      // Images: replace the whole set for this project (rows are cheap).
      const { error: delErr } = await supabase
        .from("project_images")
        .delete()
        .eq("project_id", projectId!);
      if (delErr) throw delErr;

      if (images.length) {
        const { error: insErr } = await supabase.from("project_images").insert(
          images.map((img) => ({
            project_id: projectId!,
            category: img.category,
            storage_path: img.storage_path,
            alt_text: img.alt_text || null,
            sort_order: img.sort_order,
          })),
        );
        if (insErr) throw insErr;
      }

      if (removedPaths.length) await deleteStorageObjects(removedPaths);
      if (images.length) {
        await sweepProjectFolder(form.slug, new Set(images.map((i) => i.storage_path)));
      }

      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["public-projects"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
      toast.success("Project saved");
      navigate("/admin");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <div className="py-24 text-center text-slate-500">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdit ? "Edit Project" : "New Project"}
        </h1>
        <div className="flex gap-2">
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the project and all of its images.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await deleteProject.mutateAsync(id!);
                        toast.success("Project deleted");
                        navigate("/admin");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Delete failed");
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={save} disabled={saving || uploading}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project name</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: isEdit || f.slug ? f.slug : slugify(title),
                  }));
                }}
                placeholder="Haven Hideaway"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", slugify(e.target.value))}
                placeholder="haven-hideaway"
              />
              {form.slug && !isValidSlug(form.slug) && (
                <p className="text-xs text-red-600">Invalid slug</p>
              )}
              {isValidSlug(form.slug) && slugAvailable.data === false && (
                <p className="text-xs text-red-600">Slug already in use</p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Headline (optional)</Label>
              <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tagline (optional)</Label>
              <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-3 pt-7">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => set("published", v)}
              />
              <Label>Published</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location &amp; classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={form.location_city}
                onChange={(e) => set("location_city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={form.location_state}
                onChange={(e) => set("location_state", e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.project_type}
                onChange={(e) => set("project_type", e.target.value as ProjectType)}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROJECT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Year completed (optional)</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="2024"
                value={form.year_completed}
                onChange={(e) => set("year_completed", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Narrative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Client brief (optional)</Label>
            <Textarea
              rows={4}
              placeholder="The design problem this project solved."
              value={form.client_brief}
              onChange={(e) => set("client_brief", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Story (optional)</Label>
            <Textarea
              rows={10}
              placeholder="Long-form narrative about the project."
              value={form.story}
              onChange={(e) => set("story", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Detail blocks</Label>
            <SpecsEditor value={form.specs} onChange={(v) => set("specs", v)} />
          </div>
          <div className="space-y-2">
            <Label>Features</Label>
            <StringListEditor
              value={form.features}
              onChange={(v) => set("features", v)}
              placeholder="Custom white oak millwork"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {IMAGE_CATEGORIES.map((category) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{IMAGE_CATEGORY_LABELS[category]}</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple={category === "gallery"}
                  disabled={uploading}
                  onChange={(e) => {
                    handleUpload(category, e.target.files);
                    e.target.value = "";
                  }}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {byCategory[category].map((img) => (
                  <div
                    key={img.storage_path}
                    className="border border-slate-200 rounded overflow-hidden"
                  >
                    <img
                      src={getPublicUrl(img.storage_path)}
                      alt=""
                      className="w-full aspect-[4/3] object-cover"
                      loading="lazy"
                    />
                    <div className="p-2 space-y-2">
                      <Input
                        value={img.alt_text}
                        placeholder="Alt text"
                        onChange={(e) =>
                          setImages((prev) =>
                            prev.map((i) =>
                              i.storage_path === img.storage_path
                                ? { ...i, alt_text: e.target.value }
                                : i,
                            ),
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <div className="flex justify-between">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveImage(img, -1)}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveImage(img, 1)}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeImage(img)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminProjectForm() {
  return (
    <AdminProtected>
      <AdminProjectFormInner />
    </AdminProtected>
  );
}
