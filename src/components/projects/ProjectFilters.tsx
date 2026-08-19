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
  const hasFilters = activeType !== "all" || activeTags.length > 0;

  return (
    <div className="space-y-4">
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

      {tags.length > 0 && (
        <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-4">
            {tags.map((tag) => {
              const active = activeTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.slug)}
                  className={[
                    "whitespace-nowrap border-b py-1 text-xs transition-colors duration-300",
                    active
                      ? "border-brand text-brand"
                      : "border-transparent text-stone hover:text-ink",
                  ].join(" ")}
                >
                  {tag.name}
                </button>
              );
            })}
            {hasFilters && (
              <button
                type="button"
                onClick={onClear}
                className="ml-2 whitespace-nowrap text-xs text-stone underline underline-offset-4 hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
