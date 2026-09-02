import { useState } from "react";
import { ImageIcon, Lock, X } from "lucide-react";
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
import { mediaUrl, usePageContent, type MediaRef, type PageName } from "@/hooks/usePageContent";
import {
  useClearPageDefault,
  useClearPageImage,
  useSetPageDefault,
  useSetPageImage,
} from "@/hooks/admin/usePageContentAdmin";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
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
 *
 * Three layers decide what the visitor sees: the photograph the client chose,
 * then the default a developer pinned, then project photography.
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
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const setImage = useSetPageImage();
  const clearImage = useClearPageImage();
  const setDefault = useSetPageDefault();
  const clearDefault = useClearPageDefault();
  const { defaultImage } = usePageContent();
  const auth = useAdminAuth();
  const isDeveloper = auth.status === "authorized" && auth.role === "developer";
  const { toast } = useToast();

  const chosenUrl = mediaUrl(current);
  const pinned = defaultImage(page, slot);
  const pinnedUrl = mediaUrl(pinned);
  const url = chosenUrl ?? pinnedUrl ?? fallbackUrl;
  const source: "chosen" | "default" | "automatic" | "none" = chosenUrl
    ? "chosen"
    : pinnedUrl
      ? "default"
      : fallbackUrl
        ? "automatic"
        : "none";

  const busy =
    uploading ||
    setImage.isPending ||
    clearImage.isPending ||
    setDefault.isPending ||
    clearDefault.isPending;

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

  const pickDefault = async (image: PickedImage) => {
    try {
      await setDefault.mutateAsync({ page, slot, ...image, previous: pinned });
      setDefaultOpen(false);
      toast({ title: `Default for ${label} set.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const uploadDefault = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const path = await uploadSiteImage(file, setProgress);
      await setDefault.mutateAsync({
        page,
        slot,
        bucket: SITE_IMAGES_BUCKET,
        path,
        alt: null,
        previous: pinned,
      });
      setDefaultOpen(false);
      toast({ title: `Default for ${label} set.` });
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

  const removeDefault = async () => {
    try {
      await clearDefault.mutateAsync({ page, slot, previous: pinned });
      toast({ title: `Default for ${label} removed.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not clear", description: (err as Error).message });
    }
  };

  const badge =
    source === "chosen" ? "Chosen" : source === "default" || source === "automatic" ? "Default" : null;

  return (
    <div className="rounded border border-line bg-card p-3">
      <div className={`relative overflow-hidden rounded bg-sand ${aspect}`}>
        {url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone">
            <ImageIcon className="h-5 w-5" />
            <span className="px-3 text-center text-[11px]">No photography available yet</span>
          </div>
        )}
        {badge && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              source === "chosen" ? "bg-ink/90 text-paper" : "bg-paper/90 text-stone"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{label}</p>
          {help && <p className="mt-0.5 text-xs text-stone">{help}</p>}
          {source === "default" && (
            <p className="mt-0.5 text-xs text-stone">Default photograph — shown on the site now</p>
          )}
          {source === "automatic" && (
            <p className="mt-0.5 text-xs text-stone">
              {fallbackFrom ? `From ${fallbackFrom} — shown on the site now` : "Project photography is used"}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline" disabled={busy}>
                {current ? "Change" : "Choose your own"}
              </Button>
            </DialogTrigger>
            <DialogContent className="grid h-[94dvh] max-h-[94dvh] w-[96vw] max-w-[1500px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-4 sm:p-5">
              <DialogHeader className="px-1 pb-3">
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

      {isDeveloper && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="flex items-center gap-1 text-[11px] text-stone">
            <Lock className="h-3 w-3" />
            Developer
          </span>
          <Dialog open={defaultOpen} onOpenChange={setDefaultOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" disabled={busy}>
                {pinned ? "Change default" : "Set default"}
              </Button>
            </DialogTrigger>
            <DialogContent className="grid h-[94dvh] max-h-[94dvh] w-[96vw] max-w-[1500px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-4 sm:p-5">
              <DialogHeader className="px-1 pb-3">
                <DialogTitle>Default for {label}</DialogTitle>
              </DialogHeader>
              <ImagePicker
                current={pinned}
                busy={busy}
                progress={progress}
                onPick={pickDefault}
                onUpload={uploadDefault}
              />
            </DialogContent>
          </Dialog>
          {pinned && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-stone"
              disabled={busy}
              onClick={removeDefault}
            >
              Clear default
            </Button>
          )}
          <span className="text-[11px] text-stone">
            {pinned
              ? "Kept if the project is deleted."
              : "Pin a photograph the site falls back to."}
          </span>
        </div>
      )}
    </div>
  );
}
