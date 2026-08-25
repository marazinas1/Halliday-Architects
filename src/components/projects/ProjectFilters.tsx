import { PROJECT_TYPES, PROJECT_TYPE_LABELS, type ProjectType } from "@/hooks/usePublicProjects";
import type { Tag } from "@/hooks/admin/useTags";

type Props = {
  types: ProjectType[];
  activeType: ProjectType | "all";
  onType: (t: ProjectType | "all") => void;
  tags: Tag[];
  activeTags: string[];
  onToggleTag: (slug: string) => void;
  onClear: () => void;
};

const chip = (active: boolean) =>
  [
    "whitespace-nowrap border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors duration-300",
    active
      ? "border-ink bg-ink text-paper"
      : "border-line bg-transparent text-stone hover:border-ink hover:text-ink",
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
    <div className="space-y-4">
      {showTypes && (
        <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            <button type="button" className={chip(activeType === "all")} onClick={() => onType("all")}>
              All work
            </button>
            {PROJECT_TYPES.filter((t) => types.includes(t)).map((t) => (
              <button key={t} type="button" className={chip(activeType === t)} onClick={() => onType(t)}>
                {PROJECT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      {showTags && (
        <div className="border-b border-line pb-6 mb-12">
          <p className="label-uppercase mb-4">Filter by detail</p>
          <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = activeTags.includes(tag.slug);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.slug)}
                    className={chip(active)}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {activeTags.length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className={[
                    "whitespace-nowrap border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors duration-300",
                    "border-line text-stone hover:border-ink hover:text-ink",
                  ].join(" ")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
