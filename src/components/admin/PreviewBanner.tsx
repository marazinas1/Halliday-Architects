import { Eye } from "lucide-react";

/** Fixed bar shown on /admin/preview/* so a preview tab is never mistaken
 *  for the live site. */
const PreviewBanner = ({ label }: { label: string }) => (
  <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-ink px-4 py-2 text-xs uppercase tracking-[0.14em] text-background">
    <Eye className="h-3.5 w-3.5" />
    Preview — {label}. Nothing here is published.
  </div>
);

export default PreviewBanner;
