import { Link, useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

export type SectionTab = {
  label: string;
  /** Route to navigate to. Omitted for in-page tabs. */
  to?: string;
  /** Identifier for in-page tabs. */
  value?: string;
  match?: (path: string) => boolean;
};

type Props = {
  tabs: SectionTab[];
  /** Active in-page tab. When given, tabs switch panels instead of navigating. */
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * Sub-navigation inside a website section (for example About → Team →
 * Testimonials). Tabs switch panels in place when `value`/`onChange` are given,
 * and fall back to routing links otherwise.
 */
export default function SectionTabs({ tabs, value, onChange }: Props) {
  const { pathname } = useLocation();
  const controlled = value !== undefined && Boolean(onChange);

  const base =
    "-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring";
  const state = (active: boolean) =>
    active
      ? "border-primary font-medium text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground";

  return (
    <div className="mb-8 flex w-full gap-1 overflow-x-auto border-b border-border" role="tablist">
      {tabs.map((tab) => {
        if (controlled) {
          const active = tab.value === value;
          return (
            <button
              key={tab.value ?? tab.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange?.(tab.value ?? "")}
              className={cn(base, state(active))}
            >
              {tab.label}
            </button>
          );
        }
        const active = tab.match ? tab.match(pathname) : pathname === tab.to;
        return (
          <Link key={tab.to} to={tab.to ?? "#"} className={cn(base, state(active))}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
