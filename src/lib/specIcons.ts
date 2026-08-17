import {
  ArrowUpFromLine,
  ChefHat,
  ShieldCheck,
  Sparkles,
  Waves,
  Flame,
  UtensilsCrossed,
  Sun,
  TreePine,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

// Canonical list of admin-selectable spec icon keys. Order matches the admin
// dropdown. Both the admin SpecsEditor and the public PropertyPage import from
// here so the two cannot drift apart.
export const SPEC_ICON_KEYS = [
  "elevator",
  "appliances",
  "floors",
  "resilience",
  "pool",
  "fireplace",
  "kitchen",
  "deck",
] as const;

export type SpecIconKey = (typeof SPEC_ICON_KEYS)[number];

// Full key -> lucide component map. Includes the 8 admin keys AND legacy
// keys used in the hardcoded property TSX files so migrated data still
// renders with a meaningful icon.
export const SPEC_ICON_MAP: Record<string, LucideIcon> = {
  // Admin-selectable
  elevator: ArrowUpFromLine,
  appliances: ChefHat,
  floors: Sparkles,
  resilience: ShieldCheck,
  pool: Waves,
  fireplace: Flame,
  kitchen: UtensilsCrossed,
  deck: Sun,
  // Legacy keys from hardcoded pages
  hardwood: TreePine,
  hvac: Thermometer,
  rooftop: Sparkles,
  flooring: Sparkles,
};

export function getSpecIcon(key: string | null | undefined): LucideIcon {
  if (!key) return Sparkles;
  return SPEC_ICON_MAP[key] ?? Sparkles;
}