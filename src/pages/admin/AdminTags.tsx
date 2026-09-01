import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminProtected from "@/components/admin/AdminProtected";
import SectionTabs from "@/components/admin/SectionTabs";
import { PROJECT_TABS } from "@/pages/admin/AdminProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useTags,
  useCreateTag,
  useDeleteTag,
  useRenameTag,
  useReorderTags,
} from "@/hooks/admin/useTags";

/** Tag vocabulary: add, rename, reorder, delete. Images are never touched. */
function AdminTagsInner() {
  const { data: tags = [], isLoading } = useTags();
  const create = useCreateTag();
  const rename = useRenameTag();
  const reorder = useReorderTags();
  const remove = useDeleteTag();
  const [name, setName] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= tags.length) return;
    const ids = tags.map((t) => t.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids, { onError: (e) => toast.error(e.message) });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-light text-ink">Tags</h1>
        <p className="mt-2 text-sm text-stone">
          Used to find specific design solutions quickly. Deleting a tag only removes the
          label — no images or projects are affected.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(name, {
            onSuccess: () => setName(""),
            onError: (err) => toast.error(err.message),
          });
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" />
        <Button type="submit" disabled={!name.trim() || create.isPending}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </form>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-stone">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : tags.length === 0 ? (
        <p className="border border-line px-6 py-12 text-center text-sm text-stone">
          No tags yet.
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line">
          {tags.map((tag, i) => (
            <li key={tag.id} className="flex items-center gap-2 px-3 py-2">
              <Input
                className="h-9 flex-1"
                value={edits[tag.id] ?? tag.name}
                onChange={(e) => setEdits((s) => ({ ...s, [tag.id]: e.target.value }))}
                onBlur={() => {
                  const next = (edits[tag.id] ?? tag.name).trim();
                  if (!next || next === tag.name) return;
                  rename.mutate({ id: tag.id, name: next }, { onError: (e) => toast.error(e.message) });
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => move(i, -1)}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => move(i, 1)}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="text-stone hover:text-brand">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete “{tag.name}”?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The tag is removed from every project and image. No images are deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        remove.mutate(tag.id, { onError: (e) => toast.error(e.message) })
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminTags() {
  return (
    <AdminProtected>
      <AdminTagsInner />
    </AdminProtected>
  );
}
