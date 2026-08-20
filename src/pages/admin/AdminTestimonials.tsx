import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminProtected from "@/components/admin/AdminProtected";
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
 * Client quotes. Nothing appears on the public site until a quote is published,
 * so the section simply stays hidden while this list is empty.
 */
function AdminTestimonialsInner() {
  const { data: items = [], isLoading } = useAdminTestimonials();
  const save = useSaveTestimonial();
  const setPublished = useUpdateTestimonialPublished();
  const reorder = useReorderTestimonials();
  const remove = useDeleteTestimonial();

  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [detail, setDetail] = useState("");
  const [edits, setEdits] = useState<Record<string, Partial<AdminTestimonial>>>({});

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    reorder.mutate(
      { a: items[index], b: items[target] },
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
          toast.success("Testimonial added. Publish it when you are ready.");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl text-ink">Testimonials</h1>
        <p className="mt-2 text-sm text-stone">
          Words from clients. Nothing shows on the website until you switch a quote to published.
        </p>
      </div>

      <form onSubmit={handleAdd} className="space-y-4 rounded border border-line bg-card p-5">
        <p className="text-sm font-medium text-ink">Add a testimonial</p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              Detail (optional)
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
        <Button type="submit" disabled={!quote.trim() || !author.trim() || save.isPending}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </form>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-stone">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : items.length === 0 ? (
        <p className="border border-line px-6 py-12 text-center text-sm text-stone">
          No testimonials yet. The section stays hidden on the website until you add one.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, index) => {
            const edit = edits[item.id] ?? {};
            const quoteValue = edit.quote ?? item.quote;
            const nameValue = edit.author_name ?? item.author_name;
            const detailValue = edit.author_detail ?? item.author_detail ?? "";
            const dirty =
              quoteValue !== item.quote ||
              nameValue !== item.author_name ||
              detailValue !== (item.author_detail ?? "");

            return (
              <li key={item.id} className="rounded border border-line bg-card p-5">
                <Textarea
                  rows={3}
                  value={quoteValue}
                  onChange={(e) =>
                    setEdits((s) => ({ ...s, [item.id]: { ...edit, quote: e.target.value } }))
                  }
                />
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    value={nameValue}
                    onChange={(e) =>
                      setEdits((s) => ({
                        ...s,
                        [item.id]: { ...edit, author_name: e.target.value },
                      }))
                    }
                  />
                  <Input
                    value={detailValue}
                    placeholder="Detail (optional)"
                    onChange={(e) =>
                      setEdits((s) => ({
                        ...s,
                        [item.id]: { ...edit, author_detail: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.published}
                      onCheckedChange={(published) =>
                        setPublished.mutate(
                          { id: item.id, published },
                          { onError: (e) => toast.error(e.message) },
                        )
                      }
                    />
                    <span className="text-sm text-stone">
                      {item.published ? "Published" : "Hidden"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {dirty && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={save.isPending}
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
                        Save
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The quote from {item.author_name} will be removed permanently.
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
    <AdminProtected access="owner">
      <AdminTestimonialsInner />
    </AdminProtected>
  );
}