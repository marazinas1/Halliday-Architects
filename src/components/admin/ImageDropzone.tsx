import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  /** Public URL of the current image, if any. */
  previewUrl: string | null;
  uploading: boolean;
  progress: number;
  onFile: (file: File) => void;
  onRemove: () => void;
  /** Quiet line under the zone, e.g. what the optimiser does. */
  hint?: string;
  label?: string;
};

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/avif";

/**
 * Drop-or-click image field. Drag and drop and the click path both feed the
 * same handler; the caller owns the upload so progress stays with its state.
 */
export default function ImageDropzone({
  previewUrl,
  uploading,
  progress,
  onFile,
  onRemove,
  hint = "Images are resized and converted automatically before upload.",
  label = "Drag an image here, or click to choose one",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const take = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file is not an image. Choose a JPG, PNG or WebP.");
      return;
    }
    onFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-busy={uploading}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (uploading) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (uploading) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (uploading) return;
          take(e.dataTransfer.files);
        }}
        className={cn(
          "relative overflow-hidden border border-dashed transition-colors duration-300 outline-none",
          "focus-visible:ring-1 focus-visible:ring-ink/30",
          previewUrl ? "border-line" : "border-line/80 bg-sand/40",
          !uploading && "cursor-pointer hover:border-stone/60 hover:bg-sand/60",
          dragOver && "border-ink/60 bg-sand",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            take(e.target.files);
            e.target.value = "";
          }}
        />

        {previewUrl ? (
          <div className="relative aspect-[16/9] w-full bg-sand">
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-ink/45 opacity-0 transition-opacity duration-300",
                (dragOver || uploading) && "opacity-100",
              )}
            >
              <span className="text-xs uppercase tracking-[0.14em] text-paper">
                {uploading ? "Uploading…" : "Drop to replace"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:py-16">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-stone" />
            ) : dragOver ? (
              <Upload className="h-5 w-5 text-ink" />
            ) : (
              <ImagePlus className="h-5 w-5 text-stone/70" />
            )}
            <p className="text-sm text-ink">{uploading ? "Uploading…" : label}</p>
            <p className="text-xs text-stone">JPG, PNG or WebP</p>
          </div>
        )}
      </div>

      {uploading && <Progress value={progress} className="h-1" />}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? "Replace" : "Choose image"}
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={onRemove}
            className="text-stone hover:text-brand"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-stone">{hint}</p>
    </div>
  );
}