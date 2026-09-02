import { useMemo, useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectImageLibrary } from "@/hooks/admin/useProjectImageLibrary";
import { useSiteImageLibrary } from "@/hooks/admin/useSiteImageLibrary";
import { SITE_IMAGES_BUCKET } from "@/lib/admin/uploadSiteImage";
import { cn } from "@/lib/utils";

export type PickedImage = { bucket: string; path: string; alt: string | null };

type Props = {
  current: { bucket: string; path: string } | null;
  busy?: boolean;
  progress?: number;
  onPick: (image: PickedImage) => void;
  onUpload: (file: File) => void;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/avif";

const CATEGORY_LABEL: Record<string, string> = {
  hero: "Hero",
  card: "Card",
  gallery: "Gallery",
};

/**
 * Choose a photograph from the project library — one project at a time, picked
 * from a proper list rather than a cramped tab strip — from photographs already
 * uploaded, or by uploading a new file.
 */
export default function ImagePicker({ current, busy = false, progress = 0, onPick, onUpload }: Props) {
  const { data: library, isLoading } = useProjectImageLibrary();
  const { data: uploaded = [], isLoading: uploadsLoading } = useSiteImageLibrary();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const term = search.trim().toLowerCase();
  const projects = useMemo(
    () => (library ?? []).filter((p) => !term || p.title.toLowerCase().includes(term)),
    [library, term],
  );

  const activeProject = projects.find((p) => p.id === active) ?? projects[0] ?? null;

  return (
    <div className="flex h-[70vh] min-h-0 flex-1 flex-col gap-4">
      <Tabs defaultValue="projects" className="flex min-h-0 flex-1 flex-col">

        <TabsList className="w-fit">
          <TabsTrigger value="projects">From projects</TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-stone">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading photography…
            </div>
          ) : (library ?? []).length === 0 ? (
            <p className="py-6 text-sm text-stone">No published project photography yet.</p>
          ) : (
            <div className="flex min-h-0 flex-1 gap-5">
              {/* Project list: a column on desktop, a select on narrow screens. */}
              <div className="hidden w-72 shrink-0 flex-col gap-2 md:flex">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects"
                />
                <div className="min-h-0 flex-1 overflow-y-auto rounded border border-line">
                  {projects.length === 0 ? (
                    <p className="p-3 text-xs text-stone">No project matches that.</p>
                  ) : (
                    projects.map((project) => {
                      const isActive = activeProject?.id === project.id;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => setActive(project.id)}
                          className={cn(
                            "flex w-full items-baseline justify-between gap-2 border-b border-line px-3 py-2 text-left text-xs transition-colors last:border-b-0",
                            isActive ? "bg-sand font-medium text-ink" : "text-stone hover:bg-sand/60 hover:text-ink",
                          )}
                        >
                          <span className="truncate">{project.title}</span>
                          <span className="shrink-0 text-[10px] text-stone">
                            {project.images.length}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="md:hidden">
                  <Select
                    value={activeProject?.id ?? undefined}
                    onValueChange={(value) => setActive(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {(library ?? []).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title} ({project.images.length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeProject && (
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{activeProject.title}</p>
                    <p className="text-xs text-stone">
                      {activeProject.images.length} photograph
                      {activeProject.images.length === 1 ? "" : "s"} — click one to use it
                    </p>
                  </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {(activeProject?.images ?? []).map((img) => {
                      const selected =
                        current?.bucket === "project-images" && current.path === img.storage_path;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            onPick({ bucket: "project-images", path: img.storage_path, alt: img.alt })
                          }
                          className={cn(
                            "group relative aspect-[4/3] overflow-hidden rounded border text-left transition-all",
                            selected ? "border-ink ring-2 ring-ink" : "border-line hover:border-ink/40",
                          )}
                        >
                          <img
                            src={img.url}
                            alt={img.alt}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-medium text-stone">
                            {CATEGORY_LABEL[img.category] ?? img.category}
                          </span>
                          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="line-clamp-2">{selected ? "Currently used" : img.alt}</span>
                          </span>
                          {selected && (
                            <span className="absolute right-1.5 top-1.5 rounded-full bg-ink p-1 text-paper">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="uploaded" className="flex min-h-0 flex-1 flex-col gap-3 pt-4">
          {uploadsLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-stone">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading photographs…
            </div>
          ) : uploaded.length === 0 ? (
            <p className="py-6 text-sm text-stone">
              Nothing uploaded yet. Anything you upload here can be reused from this tab.
            </p>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {uploaded.map((img) => {
                  const selected =
                    current?.bucket === SITE_IMAGES_BUCKET && current.path === img.path;
                  return (
                    <button
                      key={img.path}
                      type="button"
                      disabled={busy}
                      onClick={() => onPick({ bucket: SITE_IMAGES_BUCKET, path: img.path, alt: null })}
                      className={cn(
                        "group relative aspect-[4/3] overflow-hidden rounded border text-left transition-all",
                        selected ? "border-ink ring-2 ring-ink" : "border-line hover:border-ink/40",
                      )}
                    >
                      <img
                        src={img.url}
                        alt="Uploaded photograph"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {img.usedBy.length > 0 && (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-medium text-stone">
                          In use
                        </span>
                      )}
                      {selected && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-ink p-1 text-paper">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="pt-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) onUpload(file);
            }}
            className={cn(
              "rounded border border-dashed p-10 text-center transition-colors",
              dragging ? "border-ink bg-sand" : "border-line",
            )}
          >
            <Upload className="mx-auto mb-3 h-5 w-5 text-stone" />
            <p className="mb-1 text-sm text-ink">Drag a photograph here, or choose a file</p>
            <p className="mb-4 text-xs text-stone">
              Resized and converted automatically, and kept in your photograph library so you can
              reuse it elsewhere.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              Choose a file
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onUpload(file);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {busy && <Progress value={progress} className="h-1" />}
    </div>
  );
}
