import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useDeleteSiteImage,
  useSiteImageLibrary,
  type SiteImage,
} from "@/hooks/admin/useSiteImageLibrary";

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatSize = (bytes: number | null) =>
  bytes ? `${Math.round(bytes / 1024)} KB` : "";

/**
 * Every photograph uploaded through a picker, with where it is used. Files
 * nothing points at can be deleted here, which is the only place uploads are
 * removed — so a photograph stays reusable after you swap it out of a slot.
 */
export default function AdminPhotographs() {
  const { data: images = [], isLoading } = useSiteImageLibrary();
  const remove = useDeleteSiteImage();
  const { toast } = useToast();

  const del = async (image: SiteImage) => {
    try {
      await remove.mutateAsync(image);
      toast({ title: "Photograph deleted." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not delete", description: (err as Error).message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Photographs</h1>
        <p className="mt-1 text-sm text-stone">
          Photographs you have uploaded to the site. Project photography lives with its project and
          is not listed here.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-stone">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : images.length === 0 ? (
        <p className="rounded border border-line bg-card p-6 text-sm text-stone">
          Nothing uploaded yet. Anything you upload from a page's "Choose your own" panel appears
          here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div key={image.path} className="overflow-hidden rounded border border-line bg-card">
              <div className="aspect-[4/3] bg-sand">
                <img
                  src={image.url}
                  alt="Uploaded photograph"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 p-3">
                <p className="text-xs text-stone">
                  Uploaded {formatDate(image.createdAt)} {formatSize(image.sizeBytes)}
                </p>
                {image.usedBy.length ? (
                  <ul className="space-y-0.5 text-xs text-ink">
                    {image.usedBy.map((use) => (
                      <li key={use}>{use}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone">Not used anywhere</p>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={image.usedBy.length > 0 || remove.isPending}
                  onClick={() => del(image)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
