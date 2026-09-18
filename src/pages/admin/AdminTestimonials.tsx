import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminSection from "@/components/admin/AdminSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useAdminTestimonials,
  useDeleteTestimonial,
  useReorderTestimonials,
  useSaveTestimonial,
  useUpdateTestimonialPublished,
  type AdminTestimonial,
} from "@/hooks/admin/useAdminTestimonials";

/**
 * Client quotes, edited inline. Each row collapses to the author, its state and
 * its order; opening a row reveals the full editor. Nothing appears on the
 * public site until a quote is published.
 */
export function TestimonialsManager({ embedded = false }: { embedded?: boolean }) {
  const { data: items = [], isLoading } = useAdminTestimonials();
  const save = useSaveTestimonial();
  const setPublished = useUpdateTestimonialPublished();
  const reorder = useReorderTestimonials();
  const remove = useDeleteTestimonial();

  const [adding, setAdding] = useState(false);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [detail, setDetail] = useState("");
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<AdminTestimonial>>>({});

  const toggle = (id: string) =>
    setOpenIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id]));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    reorder.mutate(
      { a: items[index]!, b: items[target]! },
      { onError: (e) => toast.error(e.message) },
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(
      {
        quote,
        author_name: author,
        author_detail: detail,
        sort_order: (items[items.length - 1]?.sort_order ?? 0) + 1,
        published: false,
      },
      {
        onSuccess: () => {
          setQuote("");
          setAuthor("");
          setDetail("");
          setAdding(false);
          toast.success("Testimonial added. Publish it when you are ready.");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="w-full space-y-8">
      {embedded ? (
        <div>
          <h2 className="text-lg font-medium text-foreground">Testimonials</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Words from clients. Nothing shows on the website until a quote is published.
          </p>
        </div>
      ) : (
        <AdminPageHeader
          title="Testimonials"
          description="Words from clients. Nothing shows on the website until you switch a quote to published."
          action={
            <Button type="button" onClick={() => setAdding((v) => !v)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add testimonial
            </Button>
          }
        />
      )}

      {(adding || embedded) && (
        <form onSubmit={handleAdd} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">Add a testimonial</p>
          <div>
            <Label htmlFor="quote" className="text-sm">
              Quote
            </Label>
            <Textarea
              id="quote"
              rows={4}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="What the client wrote or said, in their own words."
              className="mt-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="author" className="text-sm">
                Name
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Client name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="detail" className="text-sm">
                Detail <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="New home, Ocean City"
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Button type="submit" disabled={!quote.trim() || !author.trim() || save.isPending}>
              {save.isPending ? "Saving…" : "Add"}
            </Button>
            {!embedded && (
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No testimonials yet. The section stays hidden on the website until you add one.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const open = openIds.includes(item.id);
            const edit = edits[item.id] ?? {};
            const quoteValue = edit.quote ?? item.quote;
            const nameValue = edit.author_name ?? item.author_name;
            const detailValue = edit.author_detail ?? item.author_detail ?? "";
            const dirty =
              quoteValue !== item.quote ||
              nameValue !== item.author_name ||
              detailValue !== (item.author_detail ?? "");

            return (
              <li key={item.id} className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.author_name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.quote}
                      </span>
                    </span>
                  </button>

                  <Badge variant={item.published ? "success" : "muted"}>
                    {item.published ? "Published" : "Hidden"}
                  </Badge>
                  {dirty && <Badge variant="warning">Unsaved</Badge>}

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${item.author_name} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${item.author_name} down`}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="space-y-4 border-t border-border p-4">
                    <div>
                      <Label className="text-sm">Quote</Label>
                      <Textarea
                        rows={4}
                        className="mt-2"
                        value={quoteValue}
                        onChange={(e) =>
                          setEdits((s) => ({ ...s, [item.id]: { ...edit, quote: e.target.value } }))
                        }
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-sm">Name</Label>
                        <Input
                          className="mt-2"
                          value={nameValue}
                          onChange={(e) =>
                            setEdits((s) => ({
                              ...s,
                              [item.id]: { ...edit, author_name: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          Detail <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          className="mt-2"
                          value={detailValue}
                          placeholder="New home, Ocean City"
                          onChange={(e) =>
                            setEdits((s) => ({
                              ...s,
                              [item.id]: { ...edit, author_detail: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`published-${item.id}`}
                          checked={item.published}
                          onCheckedChange={(published) =>
                            setPublished.mutate(
                              { id: item.id, published },
                              { onError: (e) => toast.error(e.message) },
                            )
                          }
                        />
                        <Label htmlFor={`published-${item.id}`} className="text-sm">
                          Shown on site
                        </Label>
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={!dirty || save.isPending}
                          onClick={() =>
                            save.mutate(
                              {
                                id: item.id,
                                quote: quoteValue,
                                author_name: nameValue,
                                author_detail: detailValue,
                                published: item.published,
                                sort_order: item.sort_order,
                              },
                              {
                                onSuccess: () => {
                                  setEdits((s) => {
                                    const next = { ...s };
                                    delete next[item.id];
                                    return next;
                                  });
                                  toast.success("Saved.");
                                },
                                onError: (e) => toast.error(e.message),
                              },
                            )
                          }
                        >
                          {save.isPending ? "Saving…" : "Save"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete testimonial from ${item.author_name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete the testimonial from {item.author_name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                The quote is removed permanently and disappears from the website.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  remove.mutate(item.id, { onError: (e) => toast.error(e.message) })
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AdminTestimonials() {
  return (
    <AdminSection access="owner">
      <TestimonialsManager />
    </AdminSection>
  );
}
