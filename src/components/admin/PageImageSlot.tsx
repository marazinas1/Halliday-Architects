import { useState } from "react";
import { ImageIcon, X } from "lucide-react";
import ImagePicker, { type PickedImage } from "@/components/admin/ImagePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { mediaUrl, type MediaRef, type PageName } from "@/hooks/usePageContent";
import { useClearPageImage, useSetPageImage } from "@/hooks/admin/usePageContentAdmin";
import { uploadSiteImage, SITE_IMAGES_BUCKET } from "@/lib/admin/uploadSiteImage";
import { NotAnImageError } from "@/lib/images/optimizeImage";

type Props = {
  page: PageName;
  slot: string;
  label: string;
  help?: string;
  current: MediaRef | null;
  /** Tailwind aspect class, so the panel mirrors the shape on the live page. */
  aspect?: string;
  /** Photograph the live page uses when the client has not chosen one. */
  fallbackUrl?: string | null;
  /** Project the automatic photograph comes from. */
  fallbackFrom?: string | null;
};

/**
 * One editable photograph on a page, shown in the same proportion as the live
 * site so the client recognises which image they are changing.
 */
export default function PageImageSlot({
  page,
  slot,
  label,
  help,
  current,
  aspect = "aspect-[16/9]",
  fallbackUrl = null,
  fallbackFrom = null,
}: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const setImage = useSetPageImage();
  const clearImage = useClearPageImage();
  const { toast } = useToast();

  const chosenUrl = mediaUrl(current);
  const url = chosenUrl ?? fallbackUrl;
  const automatic = !chosenUrl && Boolean(fallbackUrl);

  const busy = uploading || setImage.isPending || clearImage.isPending;

  const pick = async (image: PickedImage) => {
    try {
      await setImage.mutateAsync({ page, slot, ...image });
      setOpen(false);
      toast({ title: `${label} updated.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const path = await uploadSiteImage(file, setProgress);
      await setImage.mutateAsync({ page, slot, bucket: SITE_IMAGES_BUCKET, path, alt: null });
      setOpen(false);
      toast({ title: `${label} uploaded.` });
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

  const clear = async () => {
    try {
      await clearImage.mutateAsync({ page, slot });
      toast({ title: `${label} cleared.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not clear", description: (err as Error).message });
    }
  };

  return (
    <div className="rounded border border-line bg-card p-3">
      <div className={`relative overflow-hidden rounded bg-sand ${aspect}`}>
        {url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone">
            <ImageIcon className="h-5 w-5" />
            <span className="px-3 text-center text-[11px]">Project photography is used</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{label}</p>
          {help && <p className="mt-0.5 text-xs text-stone">{help}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline" disabled={busy}>
                {current ? "Change" : "Choose"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{label}</DialogTitle>
              </DialogHeader>
              <ImagePicker
                current={current}
                busy={busy}
                progress={progress}
                onPick={pick}
                onUpload={upload}
              />
            </DialogContent>
          </Dialog>
          {current && (
            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={clear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
