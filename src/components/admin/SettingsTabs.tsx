import SectionTabs, { type SectionTab } from "@/components/admin/SectionTabs";
import { isOwnerRole, useAdminAuth } from "@/hooks/admin/useAdminAuth";

/**
 * Settings sub-navigation. The first tab holds the business details and
 * branding; the tabs after it mirror the public site, one per editable page.
 * Editors do not see the owner-only first tab.
 */
const OWNER_TAB: SectionTab = {
  label: "Business & appearance",
  to: "/admin/settings",
  match: (p) => p.startsWith("/admin/settings"),
};

const PAGE_TABS: SectionTab[] = [
  { label: "Home", to: "/admin/home", match: (p) => p.startsWith("/admin/home") },
  { label: "About", to: "/admin/about", match: (p) => p.startsWith("/admin/about") || p.startsWith("/admin/team") },
  { label: "Services", to: "/admin/services", match: (p) => p.startsWith("/admin/services") },
  { label: "Photographs", to: "/admin/photographs", match: (p) => p.startsWith("/admin/photographs") },
  { label: "Contact", to: "/admin/contact", match: (p) => p.startsWith("/admin/contact") },
];

export default function SettingsTabs() {
  const auth = useAdminAuth();
  const owner = auth.status === "authorized" && isOwnerRole(auth.role);
  const tabs = owner ? [OWNER_TAB, ...PAGE_TABS] : PAGE_TABS;
  return <SectionTabs tabs={tabs} />;
}
