import { useRef, useState } from "react";
import { Check, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useProjectImageLibrary } from "@/hooks/admin/useProjectImageLibrary";
import { cn } from "@/lib/utils";

export type HeroSelection = { bucket: string; path: string } | null;

type Props = {
  /** Current selection, resolved to a public URL for the preview. */
  currentUrl: string | null;
  current: HeroSelection;
  uploading: boolean;
  progress: number;
  onPickExisting: (storagePath: string) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/avif";

/**
 * Two ways to set the homepage hero: reuse a photograph that already belongs to
 * a project (referenced in place, never copied), or upload a standalone one.
 */
export default function HeroImagePicker({
  currentUrl,
  current,
  uploading,
  progress,
  onPickExisting,
  onUpload,
  onClear,
}: Props) {
  const { data: library, isLoading } = useProjectImageLibrary();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const term = search.trim().toLowerCase();
  const projects = (library ?? []).filter(
    (p) => !term || p.title.toLowerCase().includes(term),
  );

  return (
    <div className="space-y-5">
      <div className="rounded border border-line bg-sand overflow-hidden">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Homepage hero"
            className="w-full aspect-[16/7] object-cover"
          />
        ) : (
          <div className="w-full aspect-[16/7] flex flex-col items-center justify-center gap-2 text-stone">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">
              No hero image — the homepage shows a plain block instead.
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-stone">
          {current
            ? current.bucket === "project-images"
              ? "Using a photograph from a project. Clearing this never deletes the project's copy."
              : "Using an uploaded photograph stored for the homepage."
            : "Choose a photograph below."}
        </p>
        {current && (
          <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {uploading && <Progress value={progress} className="h-1" />}

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">From projects</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="pt-4 space-y-5">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects"
            className="max-w-xs"
          />
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-stone">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading photography…
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-stone">No published project images yet.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id}>
                <p className="text-xs font-medium uppercase tracking-wider text-stone mb-2">
                  {project.title}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {project.images.map((img) => {
                    const selected =
                      current?.bucket === "project-images" && current.path === img.storage_path;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        disabled={uploading}
                        onClick={() => onPickExisting(img.storage_path)}
                        className={cn(
                          "relative aspect-[4/3] overflow-hidden rounded border transition-all",
                          selected
                            ? "border-ink ring-2 ring-ink"
                            : "border-line hover:border-ink/40",
                        )}
                      >
                        <img
                          src={img.url}
                          alt={img.alt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {selected && (
                          <span className="absolute top-1 right-1 rounded-full bg-ink text-paper p-1">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="upload" className="pt-4">
          <div className="rounded border border-dashed border-line p-8 text-center">
            <Upload className="h-5 w-5 mx-auto text-stone mb-3" />
            <p className="text-sm text-ink mb-1">Upload a photograph for the homepage</p>
            <p className="text-xs text-stone mb-4">
              Resized and converted automatically. Use this for images that are not part of a
              project.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Choose a file"}
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
    </div>
  );
}
