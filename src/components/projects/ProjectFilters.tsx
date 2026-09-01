import { PROJECT_TYPES, PROJECT_TYPE_LABELS, type ProjectType } from "@/hooks/usePublicProjects";
import type { Tag } from "@/hooks/admin/useTags";
import { Button } from "@/components/ui/button";

type Props = {
  types: ProjectType[];
  activeType: ProjectType | "all";
  onType: (t: ProjectType | "all") => void;
  tags: Tag[];
  activeTags: string[];
  onToggleTag: (slug: string) => void;
  onClear: () => void;
};

const tab = (active: boolean) =>
  [
    "h-auto rounded-none border-0 border-b px-0 pb-1 pt-0 text-[11px] font-medium uppercase tracking-[0.16em] shadow-none transition-colors duration-300 hover:bg-transparent",
    active
      ? "border-ink bg-transparent text-ink"
      : "border-transparent bg-transparent text-stone hover:border-transparent hover:text-ink",
  ].join(" ");

/**
 * Filter bar for the portfolio index. Horizontally scrollable on small
 * screens so it stays usable on a phone in front of a client.
 *
 * A row only renders when it actually offers a choice: the type row needs more
 * than one type, the tag row more than one tag. When neither qualifies the
 * component returns null and the page goes straight to the grid.
 */
export default function ProjectFilters({
  types,
  activeType,
  onType,
  tags,
  activeTags,
  onToggleTag,
  onClear,
}: Props) {
  const showTypes = types.length > 1;
  const showTags = tags.length > 1;

  if (!showTypes && !showTags) return null;

  const hasFilters = activeType !== "all" || activeTags.length > 0;

  return (
    <div className="space-y-5">
      {showTypes && (
        <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max justify-center gap-7 sm:min-w-0 sm:flex-wrap">
            <Button type="button" variant="ghost" className={tab(activeType === "all")} onClick={() => onType("all")}>
              All
            </Button>
            {PROJECT_TYPES.filter((t) => types.includes(t)).map((t) => (
              <Button key={t} type="button" variant="ghost" className={tab(activeType === t)} onClick={() => onType(t)}>
                {PROJECT_TYPE_LABELS[t]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {showTags && (
        <div>
          <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max justify-center gap-7 sm:min-w-0 sm:flex-wrap">
              {tags.map((tag) => {
                const active = activeTags.includes(tag.slug);
                return (
                  <Button
                    key={tag.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onToggleTag(tag.slug)}
                    className={tab(active)}
                  >
                    {tag.name}
                  </Button>
                );
              })}
              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClear}
                  className={tab(false)}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
