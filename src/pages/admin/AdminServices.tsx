import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import AdminProtected from "@/components/admin/AdminProtected";
import ImagePicker, { type PickedImage } from "@/components/admin/ImagePicker";
import StringListEditor from "@/components/admin/StringListEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAllServices, type PublicService } from "@/hooks/useServices";
import {
  useDeleteService,
  useReorderServices,
  useSaveService,
} from "@/hooks/admin/useAdminServices";
import { uploadSiteImage, SITE_IMAGES_BUCKET } from "@/lib/admin/uploadSiteImage";
import { useResolvedPageImages } from "@/hooks/useResolvedPageImages";
import { supabase } from "@/integrations/supabase/client";
import { NotAnImageError } from "@/lib/images/optimizeImage";

type Draft = {
  id?: string;
  title: string;
  body: string;
  includes: string[];
  image_bucket: string | null;
  image_path: string | null;
  published: boolean;
  imageUrl: string | null;
};

const EMPTY: Draft = {
  title: "",
  body: "",
  includes: [],
  image_bucket: null,
  image_path: null,
  published: true,
  imageUrl: null,
};

function toDraft(service: PublicService): Draft {
  return {
    id: service.id,
    title: service.title,
    body: service.body,
    includes: service.includes,
    image_bucket: service.image_bucket,
    image_path: service.image_path,
    published: service.published,
    imageUrl: service.imageUrl,
  };
}

function ServicesBody() {
  const { data: services, isLoading } = useAllServices();
  const saveService = useSaveService();
  const removeService = useDeleteService();
  const reorder = useReorderServices();
  const { toast } = useToast();
  const { serviceFallback } = useResolvedPageImages();

  const [order, setOrder] = useState<PublicService[]>([]);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (services) setOrder(services);
  }, [services]);

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    try {
      await reorder.mutateAsync(next);
    } catch (err) {
      toast({ variant: "destructive", title: "Could not reorder", description: (err as Error).message });
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast({ variant: "destructive", title: "A title is needed" });
      return;
    }
    try {
      await saveService.mutateAsync({
        id: editing.id,
        title: editing.title,
        body: editing.body,
        includes: editing.includes,
        image_bucket: editing.image_bucket,
        image_path: editing.image_path,
        published: editing.published,
        sort_order:
          editing.id
            ? Math.max(order.findIndex((s) => s.id === editing.id) + 1, 1)
            : order.length + 1,
      });
      setEditing(null);
      toast({ title: "Saved", description: "Service updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const remove = async (service: PublicService) => {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    try {
      await removeService.mutateAsync(service);
      toast({ title: "Deleted", description: `${service.title} removed.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not delete", description: (err as Error).message });
    }
  };

  const pick = (image: PickedImage) => {
    setEditing((d) =>
      d
        ? {
            ...d,
            image_bucket: image.bucket,
            image_path: image.path,
            imageUrl: null,
          }
        : d,
    );
    setPickerOpen(false);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const path = await uploadSiteImage(file, setProgress);
      setEditing((d) =>
        d ? { ...d, image_bucket: SITE_IMAGES_BUCKET, image_path: path, imageUrl: null } : d,
      );
      setPickerOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          err instanceof NotAnImageError ? err.message : (err as Error).message ?? "Please try again.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /** Public URL for the photograph currently attached to the open service. */
  const editingUrl =
    editing?.imageUrl ??
    (editing?.image_bucket && editing.image_path
      ? supabase.storage.from(editing.image_bucket).getPublicUrl(editing.image_path).data.publicUrl
      : null);

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl text-ink">Services</h1>
          <p className="text-sm text-stone">
            Each service is a full-width band on the services page, alternating photograph and text.
            Use the arrows to change the order they appear in.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/services" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View page
            </Link>
          </Button>
          <Button onClick={() => setEditing({ ...EMPTY })}>
            <Plus className="mr-2 h-4 w-4" />
            Add service
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-stone">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : order.length === 0 ? (
        <p className="py-10 text-sm text-stone">No services yet.</p>
      ) : (
        <ul className="space-y-2">
          {order.map((service, index) => (
            <li
              key={service.id}
              className="flex items-center gap-3 rounded border border-line bg-card p-3"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-sand">
                {(service.imageUrl ?? serviceFallback(index).url) ? (
                  <img
                    src={service.imageUrl ?? serviceFallback(index).url ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                )}
                {!service.imageUrl && serviceFallback(index).url && (
                  <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center text-[9px] uppercase tracking-wide text-paper">
                    Automatic
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{service.title}</p>
                <p className="truncate text-xs text-stone">
                  {service.published ? "Published" : "Hidden"}
                  {service.includes.length ? ` · ${service.includes.join(" · ")}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Move down"
                  disabled={index === order.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(toDraft(service))}>
                  Edit
                </Button>
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(service)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="svc-title">Title</Label>
                <Input
                  id="svc-title"
                  className="mt-2"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="svc-body">Description</Label>
                <Textarea
                  id="svc-body"
                  rows={6}
                  className="mt-2"
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </div>

              <div>
                <Label>What it covers</Label>
                <p className="mb-2 mt-1 text-xs text-stone">
                  Shown as a single line beneath the description.
                </p>
                <StringListEditor
                  value={editing.includes}
                  onChange={(includes) => setEditing({ ...editing, includes })}
                  placeholder="Architectural Design"
                />
              </div>

              <div>
                <Label>Photograph</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-20 w-28 overflow-hidden rounded bg-sand">
                    {editingUrl ? (
                      <img src={editingUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                    {editing.image_path ? "Change" : "Choose"}
                  </Button>
                  {editing.image_path && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditing({ ...editing, image_bucket: null, image_path: null, imageUrl: null })
                      }
                    >
                      <X className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-xs text-stone">
                  Left empty, project photography is used for this band.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="svc-published"
                  checked={editing.published}
                  onCheckedChange={(published) => setEditing({ ...editing, published })}
                />
                <Label htmlFor="svc-published">Show on the services page</Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saveService.isPending}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Service photograph</DialogTitle>
          </DialogHeader>
          <ImagePicker
            current={
              editing?.image_bucket && editing.image_path
                ? { bucket: editing.image_bucket, path: editing.image_path }
                : null
            }
            busy={uploading}
            progress={progress}
            onPick={pick}
            onUpload={upload}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminServices() {
  return (
    <AdminProtected>
      <ServicesBody />
    </AdminProtected>
  );
}
