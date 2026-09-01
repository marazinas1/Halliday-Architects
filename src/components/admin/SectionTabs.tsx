import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export type SectionTab = { label: string; to: string; match?: (path: string) => boolean };

/**
 * Sub-navigation inside a website section (for example About → Team →
 * Testimonials), so related screens stay grouped instead of crowding the
 * sidebar.
 */
export default function SectionTabs({ tabs }: { tabs: SectionTab[] }) {
  const { pathname } = useLocation();
  return (
    <div className="-mx-1 mb-8 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((tab) => {
        const active = tab.match ? tab.match(pathname) : pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
              active ? "border-ink font-medium text-ink" : "border-transparent text-stone hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
