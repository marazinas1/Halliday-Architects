import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/lib/router-compat";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Loader2, Eye } from "lucide-react";

import AdminProtected from "@/components/admin/AdminProtected";
import StringListEditor from "@/components/admin/StringListEditor";
import SpecsEditor, { SpecItem } from "@/components/admin/SpecsEditor";
import ProjectImageManager from "@/components/admin/ProjectImageManager";
import ProjectTagPicker from "@/components/admin/ProjectTagPicker";
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
import { isValidSlug, slugify } from "@/lib/admin/slug";
import { getPublicUrl } from "@/lib/admin/imageUpload";
import { openPreview } from "@/lib/admin/preview";

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
  const [saving, setSaving] = useState(false);

  const slugAvailable = useSlugAvailability(form.slug, id);

  useEffect(() => {
    if (!data) return;
    const p = data.project as Record<string, unknown>;
    setForm({
      slug: (p["slug"] as string) ?? "",
      title: (p["title"] as string) ?? "",
      headline: (p["headline"] as string) ?? "",
      tagline: (p["tagline"] as string) ?? "",
      description: (p["description"] as string) ?? "",
      location_city: (p["location_city"] as string) ?? "",
      location_state: (p["location_state"] as string) ?? "",
      project_type: (PROJECT_TYPES as readonly string[]).includes(p["project_type"] as string)
        ? (p["project_type"] as ProjectType)
        : "new_build",
      year_completed: p["year_completed"] != null ? String(p["year_completed"]) : "",
      client_brief: (p["client_brief"] as string) ?? "",
      story: (p["story"] as string) ?? "",
      sort_order: (p["sort_order"] as number) ?? 0,
      published: (p["published"] as boolean) ?? false,
      specs: asArray<SpecItem>(p["specs"]),
      features: asArray<string>(p["features"]),
    });
  }, [data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!isValidSlug(form.slug)) {
      toast.error("Slug is invalid");
      return;
    }
    if (slugAvailable.data === false) {
      toast.error("Slug is already in use");
      return;
    }

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

      // Images manage themselves — every action in the image manager writes
      // straight to the database, so a save never rewrites those rows.
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["public-projects"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
      toast.success("Project saved");
      // A new project goes straight to its own edit screen so images can be
      // added immediately.
      navigate(isEdit ? "/admin/projects" : `/admin/projects/${projectId}/edit`, { replace: !isEdit });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <div className="py-24 text-center text-stone">Loading…</div>;
  }

  /**
   * Opens the public project page in a new tab rendered from the current form
   * state. Images come from the rows already saved by the image manager.
   */
  const preview = () => {
    const images = (data?.images ?? []) as Array<{
      id: string;
      category: string;
      storage_path: string;
      alt_text: string | null;
      is_cover: boolean;
    }>;
    const hero =
      images.find((i) => i.category === "hero") ?? images.find((i) => i.is_cover) ?? images[0];
    openPreview("project", {
      project: {
        id: id ?? "preview",
        slug: form.slug || "preview",
        title: form.title || "Untitled project",
        headline: form.headline || null,
        tagline: form.tagline || null,
        description: form.description || null,
        location_city: form.location_city || null,
        location_state: form.location_state || null,
        project_type: form.project_type,
        year_completed: form.year_completed ? Number(form.year_completed) : null,
        client_brief: form.client_brief || null,
        story: form.story || null,
        specs: form.specs,
        features: form.features.filter((f) => f.trim()),
        published: form.published,
      },
      location: [form.location_city, form.location_state].filter(Boolean).join(", "),
      heroUrl: hero ? getPublicUrl(hero.storage_path) : null,
      gallery: images
        .filter((i) => i.id !== hero?.id && i.category !== "card")
        .map((i) => ({
          id: i.id,
          src: getPublicUrl(i.storage_path),
          alt: i.alt_text ?? form.title,
        })),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">
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
                        navigate("/admin/projects");
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
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
          <Button variant="outline" onClick={preview} disabled={saving}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
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
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-stone">
                The first four published projects by sort order appear on the homepage —
                change the order to change which.
              </p>
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
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit ? (
            <ProjectTagPicker projectId={id!} />
          ) : (
            <p className="text-sm text-stone">Save the project first to assign tags.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit ? (
            <ProjectImageManager projectId={id!} slug={form.slug} />
          ) : (
            <p className="text-sm text-stone">
              Save the project first — images are attached to a saved project.
            </p>
          )}
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
