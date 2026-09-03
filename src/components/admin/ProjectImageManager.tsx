import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Loader2, Star, Tag as TagIcon, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  IMAGE_CATEGORIES,
  IMAGE_CATEGORY_LABELS,
  deleteStorageObjects,
  getPublicUrl,
  uploadImage,
  type ImageCategory,
} from "@/lib/admin/imageUpload";
import { useTags, useCreateTag } from "@/hooks/admin/useTags";
import { useImageTags, setTagForImages } from "@/hooks/admin/useImageTags";

type Row = {
  id: string;
  category: ImageCategory;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
};

type Pending = { key: string; name: string; progress: number; error?: string };

function useProjectImages(projectId: string) {
  return useQuery({
    queryKey: ["admin-project-images", projectId],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("project_images")
        .select("id, category, storage_path, alt_text, sort_order, is_cover")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

function Thumb({
  row,
  selected,
  onSelect,
  onCover,
  onCategory,
  onAlt,
  onDelete,
}: {
  row: Row;
  selected: boolean;
  onSelect: (v: boolean) => void;
  onCover: () => void;
  onCategory: (c: ImageCategory) => void;
  onAlt: (v: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const [alt, setAlt] = useState(row.alt_text ?? "");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border bg-paper transition-colors",
        selected ? "border-ink" : "border-line",
        isDragging && "opacity-60",
      )}
    >
      <div className="relative aspect-[4/3] bg-sand">
        <img
          src={getPublicUrl(row.storage_path)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <span className="bg-paper/90 p-1">
            <Checkbox
              checked={selected}
              onCheckedChange={(v) => onSelect(v === true)}
              aria-label="Select image"
            />
          </span>
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="absolute right-2 top-2 cursor-grab bg-paper/90 p-1.5 text-stone hover:text-ink"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        {row.is_cover && (
          <span className="absolute bottom-2 left-2 bg-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-paper">
            Cover
          </span>
        )}
      </div>

      <div className="space-y-2 p-2">
        <Input
          value={alt}
          placeholder="Describe this photograph (optional)"
          className="h-8 text-xs"
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => alt !== (row.alt_text ?? "") && onAlt(alt)}
        />
        <div className="flex items-center gap-1">
          <select
            aria-label="Category"
            className="h-8 flex-1 border border-line bg-paper px-2 text-xs"
            value={row.category}
            onChange={(e) => onCategory(e.target.value as ImageCategory)}
          >
            {IMAGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {IMAGE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", row.is_cover ? "text-brand" : "text-stone")}
            title={row.is_cover ? "This is the cover" : "Make cover"}
            onClick={onCover}
          >
            <Star className={cn("h-3.5 w-3.5", row.is_cover && "fill-current")} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone hover:text-brand"
            title="Delete image"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Project image manager: multi-file drop with per-file progress, drag to
 * reorder, cover selection, categories, bulk tagging and delete. Every action
 * writes straight to the database, so nothing depends on a later save.
 */
export default function ProjectImageManager({
  projectId,
  slug,
}: {
  projectId: string;
  slug: string;
}) {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useProjectImages(projectId);
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const imageIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const { data: tagMap = {} } = useImageTags(imageIds);

  const [pending, setPending] = useState<Pending[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [newTag, setNewTag] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-project-images", projectId] });
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    qc.invalidateQueries({ queryKey: ["public-projects"] });
    qc.invalidateQueries({ queryKey: ["public-gallery"] });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    const entries: Pending[] = images.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      progress: 0,
    }));
    setPending((p) => [...p, ...entries]);

    let order = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
    for (let i = 0; i < images.length; i++) {
      const entry = entries[i];
      try {
        const { storage_path } = await uploadImage({
          file: images[i],
          category: "gallery",
          slug,
          onProgress: (percent) =>
            setPending((p) => p.map((x) => (x.key === entry.key ? { ...x, progress: percent } : x))),
        });
        const { error } = await supabase.from("project_images").insert({
          project_id: projectId,
          category: "gallery",
          storage_path,
          sort_order: order++,
        });
        if (error) throw error;
        setPending((p) => p.filter((x) => x.key !== entry.key));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload failed";
        setPending((p) => p.map((x) => (x.key === entry.key ? { ...x, error: message } : x)));
        toast.error(`${entry.name}: ${message}`);
      }
    }
    refresh();
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, oldIndex, newIndex);
    qc.setQueryData(
      ["admin-project-images", projectId],
      next.map((r, i) => ({ ...r, sort_order: i })),
    );
    try {
      await Promise.all(
        next.map((r, i) =>
          supabase
            .from("project_images")
            .update({ sort_order: i })
            .eq("id", r.id)
            .then(({ error }) => {
              if (error) throw error;
            }),
        ),
      );
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reorder failed");
      refresh();
    }
  };

  const patch = async (id: string, values: Partial<Row>) => {
    const { error } = await supabase.from("project_images").update(values).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  /**
   * Hero and Card describe a single slot each on the public pages, so setting
   * one demotes whichever photograph held that role before. Extra Heroes were
   * silently ignored by the project page, which only confused the client.
   */
  const setCategory = async (id: string, category: ImageCategory) => {
    if (category === "hero" || category === "card") {
      const previous = rows.filter((r) => r.id !== id && r.category === category);
      for (const row of previous) {
        const { error } = await supabase
          .from("project_images")
          .update({ category: "gallery" })
          .eq("id", row.id);
        if (error) return toast.error(error.message);
      }
    }
    await patch(id, { category });
  };


  const makeCover = async (id: string) => {
    const { error } = await supabase.rpc("set_project_cover", {
      _project_id: projectId,
      _image_id: id,
    });
    if (error) return toast.error(error.message);
    refresh();
  };

  const removeImage = async (row: Row) => {
    const { error } = await supabase.from("project_images").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    try {
      await deleteStorageObjects([row.storage_path]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Storage delete failed");
    }
    setSelected((s) => s.filter((x) => x !== row.id));
    refresh();
  };

  const bulkTag = async (tagId: string, apply: boolean) => {
    try {
      await setTagForImages(selected, tagId, apply);
      qc.invalidateQueries({ queryKey: ["image-tags"] });
      qc.invalidateQueries({ queryKey: ["public-projects"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tagging failed");
    }
  };

  const bulkDelete = async () => {
    const targets = rows.filter((r) => selected.includes(r.id));
    for (const row of targets) await removeImage(row);
  };

  const tagState = (tagId: string) => {
    if (!selected.length) return false;
    const count = selected.filter((id) => (tagMap[id] ?? []).includes(tagId)).length;
    if (count === 0) return false;
    return count === selected.length ? true : "indeterminate";
  };

  return (
    <div className="space-y-5">
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag images here, or click to choose files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(Array.from(e.dataTransfer.files ?? []));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center outline-hidden transition-colors",
          dragOver ? "border-ink/60 bg-sand" : "border-line/80 bg-sand/40 hover:border-stone/60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <ImagePlus className="h-5 w-5 text-stone/70" />
        <p className="text-sm text-ink">Drag images here, or click to choose files</p>
        <p className="text-xs text-stone">
          Large photographs are resized and converted to WebP automatically, then delivered at the
          right size for each screen.
        </p>

      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((p) => (
            <div key={p.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-stone">
                <span className="truncate">{p.name}</span>
                <span>{p.error ? "Failed" : `${Math.round(p.progress)}%`}</span>
              </div>
              <Progress value={p.error ? 100 : p.progress} className="h-1" />
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border border-line bg-sand/60 px-3 py-2">
          <span className="text-xs uppercase tracking-[0.14em] text-stone">
            {selected.length} selected
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <TagIcon className="mr-1.5 h-3.5 w-3.5" />
                Tags
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 space-y-3">
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {tags.length === 0 && <p className="text-xs text-stone">No tags yet.</p>}
                {tags.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={tagState(t.id)}
                      onCheckedChange={(v) => void bulkTag(t.id, v === true)}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 border-t border-line pt-3">
                <Input
                  value={newTag}
                  placeholder="New tag"
                  className="h-8 text-xs"
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!newTag.trim() || createTag.isPending}
                  onClick={async () => {
                    try {
                      const tag = await createTag.mutateAsync(newTag);
                      setNewTag("");
                      await bulkTag(tag.id, true);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Could not create tag");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <select
            aria-label="Set category for selected"
            className="h-8 border border-line bg-paper px-2 text-xs"
            defaultValue=""
            onChange={async (e) => {
              const c = e.target.value as ImageCategory;
              if (!c) return;
              for (const id of selected) await setCategory(id, c);
              e.target.value = "";
            }}
          >
            <option value="">Set category…</option>
            {IMAGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {IMAGE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <Button type="button" variant="ghost" size="sm" onClick={() => void bulkDelete()}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected([])}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-stone">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading images…
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-stone">No images yet.</p>
      ) : (
        <>
        <p className="text-xs text-stone">
          The star marks the cover — the photograph used on the projects grid and the homepage; only
          one per project. Hero is the wide photograph at the top of the project page, Card is the
          shot used on its grid card, and Gallery is everything else. Setting a new Hero or Card
          moves the previous one back to Gallery.
        </p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map((r) => r.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {rows.map((row) => (
                <Thumb
                  key={row.id}
                  row={row}
                  selected={selected.includes(row.id)}
                  onSelect={(v) =>
                    setSelected((s) => (v ? [...s, row.id] : s.filter((x) => x !== row.id)))
                  }
                  onCover={() => void makeCover(row.id)}
                  onCategory={(c) => void setCategory(row.id, c)}
                  onAlt={(v) => void patch(row.id, { alt_text: v || null })}
                  onDelete={() => void removeImage(row)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        </>
      )}


      {rows.length > 0 && (
        <p className="text-xs text-stone">
          Image descriptions help people using screen readers and help Google understand your
          photographs. Leave one blank and we will generate a basic description from the project
          name and location.
        </p>
      )}
    </div>
  );
}
