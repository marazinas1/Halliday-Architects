import SectionTabs, { type SectionTab } from "@/components/admin/SectionTabs";

/**
 * Settings sub-navigation. First and last tabs are fixed (general business
 * settings and maintenance); the tabs between them mirror the public site,
 * one per editable page.
 */
export const SETTINGS_TABS: SectionTab[] = [
  { label: "Business & appearance", to: "/admin/settings", match: (p) => p.startsWith("/admin/settings") },
  { label: "Home texts", to: "/admin/home", match: (p) => p.startsWith("/admin/home") },
  { label: "About texts", to: "/admin/about", match: (p) => p.startsWith("/admin/about") || p.startsWith("/admin/team") },
  { label: "Services texts", to: "/admin/services", match: (p) => p.startsWith("/admin/services") },
  { label: "Contact texts", to: "/admin/contact", match: (p) => p.startsWith("/admin/contact") },
  { label: "Photographs", to: "/admin/photographs", match: (p) => p.startsWith("/admin/photographs") },
];

export default function SettingsTabs() {
  return <SectionTabs tabs={SETTINGS_TABS} />;
}
