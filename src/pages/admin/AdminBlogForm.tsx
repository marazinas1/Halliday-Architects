import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Pencil, Image as ImageIcon } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import RichTextEditor from "@/components/admin/RichTextEditor";
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

  const { data: slugFree } = useBlogSlugAvailability(slug, id);

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
  }, [existing]);

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleCover = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const previous = coverPath;
    try {
      const path = await uploadBlogCover(file, setProgress);
      setCoverPath(path);
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
      toast.success("Cover removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
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
          toast.success(id ? "Post saved" : "Post created");
          navigate("/admin/blog");
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  if (id && isLoading) return <div className="text-stone py-16 text-center">Loading…</div>;

  const categoryName = categories?.find((c) => c.id === categoryId)?.name ?? null;

  return (
    <form onSubmit={submit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/admin/blog">
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-ink">{id ? "Edit post" : "New post"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setPreview((p) => !p)}>
            {preview ? <Pencil className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button type="submit" disabled={save.isPending || uploading}>
            {save.isPending ? "Saving…" : "Save"}
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
          <div className="bg-card border border-line rounded-lg p-6 space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
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
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="mt-1.5"
                placeholder="One or two sentences shown on the blog index."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
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
                <Link to="/admin/blog/categories" className="text-xs text-stone hover:text-ink mt-1.5 inline-block">
                  Manage categories
                </Link>
              </div>

              <div className="flex items-center gap-3 sm:pt-7">
                <Switch id="published" checked={published} onCheckedChange={setPublished} />
                <Label htmlFor="published" className="cursor-pointer">
                  {published ? "Published" : "Draft"}
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-card border border-line rounded-lg p-6 space-y-4">
            <Label>Cover image</Label>
            <div className="flex items-start gap-5">
              <div className="w-48 h-32 rounded bg-sand overflow-hidden flex items-center justify-center flex-shrink-0">
                {coverPath ? (
                  <img src={getBlogImageUrl(coverPath)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-stone/60" />
                )}
              </div>
              <div className="space-y-3">
                <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleCover(e.target.files?.[0])} />
                {uploading && <Progress value={progress} className="h-1.5" />}
                {coverPath && (
                  <Button type="button" variant="outline" size="sm" onClick={removeCover}>
                    Remove cover
                  </Button>
                )}
                <p className="text-xs text-stone">Resized and converted automatically before upload.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <RichTextEditor value={body} onChange={setBody} />
          </div>
        </div>
      )}
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
