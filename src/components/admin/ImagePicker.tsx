import { useMemo, useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectImageLibrary } from "@/hooks/admin/useProjectImageLibrary";
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

/**
 * Choose a photograph either from the project library — one project at a time,
 * selected with tabs across the top — or by uploading a standalone file.
 */
export default function ImagePicker({ current, busy = false, progress = 0, onPick, onUpload }: Props) {
  const { data: library, isLoading } = useProjectImageLibrary();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const term = search.trim().toLowerCase();
  const projects = useMemo(
    () => (library ?? []).filter((p) => !term || p.title.toLowerCase().includes(term)),
    [library, term],
  );

  const activeProject =
    projects.find((p) => p.id === active) ?? projects[0] ?? null;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">From projects</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4 pt-4">
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-stone">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading photography…
            </div>
          ) : projects.length === 0 ? (
            <p className="py-6 text-sm text-stone">No published project photography yet.</p>
          ) : (
            <>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects"
                className="max-w-sm"
              />

              {/* One project at a time — the tab strip scrolls sideways. */}
              <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-line pb-px">
                {projects.map((project) => {
                  const isActive = activeProject?.id === project.id;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setActive(project.id)}
                      className={cn(
                        "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                        isActive
                          ? "border-ink text-ink"
                          : "border-transparent text-stone hover:text-ink",
                      )}
                    >
                      {project.title}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
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
                        "relative aspect-[4/3] overflow-hidden rounded border transition-all",
                        selected ? "border-ink ring-2 ring-ink" : "border-line hover:border-ink/40",
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {selected && (
                        <span className="absolute right-1 top-1 rounded-full bg-ink p-1 text-paper">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="upload" className="pt-4">
          <div className="rounded border border-dashed border-line p-8 text-center">
            <Upload className="mx-auto mb-3 h-5 w-5 text-stone" />
            <p className="mb-1 text-sm text-ink">Upload a photograph</p>
            <p className="mb-4 text-xs text-stone">
              Resized and converted automatically. Use this for photographs that are not part of a
              project.
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
