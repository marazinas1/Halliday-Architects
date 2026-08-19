import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Eye, Loader2, Pencil } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageDropzone from "@/components/admin/ImageDropzone";
import PostBody from "@/components/blog/PostBody";
import { useBlogCategories } from "@/hooks/admin/useBlogCategories";
import {
  useAdminBlogPost, useBlogSlugAvailability, useSaveBlogPost,
} from "@/hooks/admin/useAdminBlog";
import {
  deleteBlogImages, getBlogImageUrl, uploadBlogCover,
} from "@/lib/admin/uploadBlogImage";
import { NotAnImageError } from "@/lib/images/optimizeImage";
import { isValidSlug, slugify } from "@/lib/admin/slug";
import { formatPostDate } from "@/hooks/usePublicBlog";

const NO_CATEGORY = "__none__";

/** Quiet section wrapper, keeping the form readable as groups rather than a stack. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-line rounded-lg p-6 sm:p-8">
      <header className="mb-6">
        <h2 className="font-serif text-lg font-light text-ink leading-tight">{title}</h2>
        {description && <p className="text-xs text-stone mt-1">{description}</p>}
      </header>
      {children}
    </section>
  );
}

function AdminBlogFormInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: existing, isLoading } = useAdminBlogPost(id);
  const { data: categories } = useBlogCategories();
  const save = useSaveBlogPost();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  // Set while a save is in flight so the unload guard stays quiet on redirect.
  const leaving = useRef(false);

  const { data: slugFree } = useBlogSlugAvailability(slug, id);

  const markDirty = () => {
    setDirty(true);
    setJustSaved(false);
  };

  // Browser-level guard: closing the tab or reloading with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (leaving.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setSlug(existing.slug);
    setSlugTouched(true);
    setExcerpt(existing.excerpt ?? "");
    setBody(existing.body ?? "");
    setCategoryId(existing.category_id ?? NO_CATEGORY);
    setCoverPath(existing.cover_path);
    setPublished(existing.published);
    setDirty(false);
  }, [existing]);

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
    markDirty();
  };

  const handleCover = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const previous = coverPath;
    try {
      const path = await uploadBlogCover(file, setProgress);
      setCoverPath(path);
      markDirty();
      if (previous) await deleteBlogImages([previous]);
      toast.success("Cover uploaded");
    } catch (e) {
      toast.error(e instanceof NotAnImageError ? e.message : `Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeCover = async () => {
    if (!coverPath) return;
    try {
      await deleteBlogImages([coverPath]);
      setCoverPath(null);
      markDirty();
      toast.success("Cover removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const goBack = () => {
    if (dirty) {
      setLeaveOpen(true);
      return;
    }
    navigate("/admin/blog");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("A title is required");
    if (!isValidSlug(slug)) return toast.error("The URL slug is not valid");
    if (slugFree === false) return toast.error("That URL slug is already used by another post");

    save.mutate(
      {
        id,
        title: title.trim(),
        slug,
        excerpt: excerpt.trim() || null,
        body,
        cover_path: coverPath,
        category_id: categoryId === NO_CATEGORY ? null : categoryId,
        published,
      },
      {
        onSuccess: () => {
          leaving.current = true;
          setDirty(false);
          setJustSaved(true);
          toast.success(id ? "Post saved" : "Post created");
          navigate("/admin/blog");
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  if (id && isLoading) return <div className="text-stone py-16 text-center">Loading…</div>;

  const categoryName = categories?.find((c) => c.id === categoryId)?.name ?? null;
  const coverUrl = coverPath ? getBlogImageUrl(coverPath) : null;

  return (
    <form onSubmit={submit} className="space-y-8 max-w-4xl pb-12">
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-paper/90 backdrop-blur border-b border-line flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Blog
          </Button>
          <h1 className="font-serif text-xl sm:text-2xl font-light text-ink leading-tight">
            {id ? "Edit post" : "New post"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone min-w-[6rem] text-right" aria-live="polite">
            {save.isPending
              ? "Saving…"
              : dirty
                ? "Unsaved changes"
                : justSaved
                  ? "All changes saved"
                  : ""}
          </span>
          <Button type="button" variant="outline" onClick={() => setPreview((p) => !p)}>
            {preview ? <Pencil className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button type="submit" disabled={save.isPending || uploading}>
            {save.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
            ) : justSaved && !dirty ? (
              <><Check className="w-4 h-4 mr-2" />Saved</>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      {preview ? (
        <article className="bg-card border border-line rounded-lg overflow-hidden">
          {coverPath && (
            <img src={getBlogImageUrl(coverPath)} alt="" className="w-full max-h-[420px] object-cover" />
          )}
          <div className="px-8 py-10 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-stone mb-4">
              {categoryName && <span>{categoryName}</span>}
              <span>{formatPostDate(existing?.published_at ?? new Date().toISOString())}</span>
            </div>
            <h2 className="heading-section text-ink mb-8">{title || "Untitled"}</h2>
            <PostBody html={body} />
          </div>
        </article>
      ) : (
        <div className="space-y-8">
          <Section title="Post details" description="Title, web address and the summary shown on the blog index.">
            <div className="space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); markDirty(); }}
                className="mt-1.5"
              />
              <p className="text-xs mt-1.5 text-stone">
                /blog/{slug || "…"}
                {slug && !isValidSlug(slug) && <span className="text-brand"> — not a valid slug</span>}
                {slug && isValidSlug(slug) && slugFree === false && (
                  <span className="text-brand"> — already used</span>
                )}
              </p>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => { setExcerpt(e.target.value); markDirty(); }}
                rows={3}
                className="mt-1.5"
                placeholder="One or two sentences shown on the blog index."
              />
            </div>
            </div>
          </Section>

          <Section title="Publishing" description="Where the post is filed and whether visitors can see it.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); markDirty(); }}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => (dirty ? setLeaveOpen(true) : navigate("/admin/blog/categories"))}
                  className="text-xs text-stone hover:text-ink mt-1.5 inline-block"
                >
                  Manage categories
                </button>
              </div>

              <div className="flex items-center gap-3 sm:pt-7">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={(v) => { setPublished(v); markDirty(); }}
                />
                <Label htmlFor="published" className="cursor-pointer">
                  {published ? "Published" : "Draft"}
                </Label>
              </div>
            </div>
          </Section>

          <Section title="Cover image" description="Shown full width at the top of the post and on the index.">
            <ImageDropzone
              previewUrl={coverUrl}
              uploading={uploading}
              progress={progress}
              onFile={(f) => void handleCover(f)}
              onRemove={() => void removeCover()}
              label="Drag a cover image here, or click to choose one"
              hint="Images are optimised automatically — resized, converted to WebP and stripped of metadata."
            />
          </Section>

          <Section title="Body" description="Drag an image straight into the text to place it at the cursor.">
            <RichTextEditor
              value={body}
              onChange={(html) => { setBody(html); markDirty(); }}
              minHeight="620px"
            />
          </Section>
        </div>
      )}

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              This post has unsaved changes. If you leave now they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                leaving.current = true;
                setDirty(false);
                navigate("/admin/blog");
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

export default function AdminBlogForm() {
  return (
    <AdminProtected>
      <AdminBlogFormInner />
    </AdminProtected>
  );
}
