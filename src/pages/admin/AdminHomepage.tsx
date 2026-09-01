import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import HeroImagePicker, { type HeroSelection } from "@/components/admin/HeroImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  HOMEPAGE_FALLBACKS,
  heroImageUrl,
  useSiteSettings,
  type SiteSettingsRow,
} from "@/hooks/useSiteSettings";
import { useSaveSiteSettings } from "@/hooks/admin/useSiteSettingsAdmin";
import { uploadSiteImage, deleteSiteImage, SITE_IMAGES_BUCKET } from "@/lib/admin/uploadSiteImage";
import { NotAnImageError } from "@/lib/images/optimizeImage";
import { openPreview } from "@/lib/admin/preview";

type TextKey = "intro_heading";

const FIELDS: {
  key: TextKey;
  label: string;
  help: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    key: "intro_heading",
    label: "Practice statement",
    help: "The centered statement below the homepage photo wall.",
    placeholder: HOMEPAGE_FALLBACKS.introHeading,
    multiline: true,
  },
];

function HomepageBody() {
  const { settings, isLoading } = useSiteSettings();
  const save = useSaveSiteSettings();
  const { toast } = useToast();

  const [text, setText] = useState<Record<TextKey, string>>({
    intro_heading: "",
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const row = settings.row;
  const rowId = row?.id ?? null;

  useEffect(() => {
    if (!row) return;
    setText({
      intro_heading: row.intro_heading ?? "",
    });
  }, [row]);

  const current: HeroSelection =
    row?.hero_image_bucket && row?.hero_image_path
      ? { bucket: row.hero_image_bucket, path: row.hero_image_path }
      : null;
  const currentUrl = heroImageUrl(row?.hero_image_bucket, row?.hero_image_path);

  /** Only an uploaded image is ours to delete — project photography is not. */
  const dropPrevious = async () => {
    if (row?.hero_image_bucket === SITE_IMAGES_BUCKET && row.hero_image_path) {
      await deleteSiteImage(row.hero_image_path);
    }
  };

  const setHero = async (patch: Partial<SiteSettingsRow>, successMessage: string) => {
    const previous = { bucket: row?.hero_image_bucket, path: row?.hero_image_path };
    await save.mutateAsync({ id: rowId, patch });
    if (previous.bucket === SITE_IMAGES_BUCKET && previous.path) {
      await deleteSiteImage(previous.path);
    }
    toast({ title: successMessage });
  };

  const handlePickExisting = async (storagePath: string) => {
    try {
      await setHero(
        { hero_image_bucket: "project-images", hero_image_path: storagePath },
        "Hero image updated.",
      );
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const path = await uploadSiteImage(file, setProgress);
      await setHero(
        { hero_image_bucket: SITE_IMAGES_BUCKET, hero_image_path: path },
        "Hero image uploaded.",
      );
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

  const handleClear = async () => {
    try {
      await setHero({ hero_image_bucket: null, hero_image_path: null }, "Hero image cleared.");
    } catch (err) {
      toast({ variant: "destructive", title: "Could not clear", description: (err as Error).message });
    }
  };

  const handleSaveText = async () => {
    try {
      const clean = (v: string) => (v.trim().length ? v.trim() : null);
      await save.mutateAsync({
        id: rowId,
        patch: {
          intro_heading: clean(text.intro_heading),
        },
      });
      toast({ title: "Saved", description: "Homepage wording updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const handlePreview = () => {
    openPreview("homepage", {
      hero_image_bucket: row?.hero_image_bucket ?? null,
      hero_image_path: row?.hero_image_path ?? null,
      intro_heading: text.intro_heading,
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl text-ink mb-1">Homepage</h1>
          <p className="text-sm text-stone">
            The opening photograph and practice statement. Anything left empty keeps the current wording.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handlePreview} disabled={isLoading}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      <section className="border border-line rounded bg-card p-5 mb-6">
        <p className="text-sm font-medium text-ink">Hero image</p>
        <p className="text-xs text-stone mt-1 mb-4">
          Leads the homepage photo wall. Pick one from a project, or upload a photograph of your own.
        </p>
        <HeroImagePicker
          current={current}
          currentUrl={currentUrl}
          uploading={uploading || save.isPending}
          progress={progress}
          onPickExisting={handlePickExisting}
          onUpload={handleUpload}
          onClear={handleClear}
        />
      </section>

      <section className="border border-line rounded bg-card p-5">
        <p className="text-sm font-medium text-ink mb-4">Wording</p>
        <div className="space-y-5">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key} className="text-sm font-medium text-ink">
                {field.label}
              </Label>
              <p className="text-xs text-stone mt-1 mb-2">{field.help}</p>
              {field.multiline ? (
                <Textarea
                  id={field.key}
                  rows={3}
                  value={text[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => setText((t) => ({ ...t, [field.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={field.key}
                  value={text[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => setText((t) => ({ ...t, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSaveText} disabled={save.isPending}>
            Save wording
          </Button>
          <span className="text-xs text-stone">
            Empty fields fall back to the wording shown in grey.
          </span>
        </div>
      </section>
    </div>
  );
}

export default function AdminHomepage() {
  return (
    <AdminProtected access="owner">
      <HomepageBody />
    </AdminProtected>
  );
}
