/**
 * Shared Halliday Architects content — static firm facts and copy used
 * across the multi-page site.
 */

import type { LucideIcon } from "lucide-react";
import {
  DraftingCompass,
  Building2,
  Hammer,
  Home,
  HardHat,
  SquarePlus,
  ChefHat,
  UtensilsCrossed,
  Leaf,
  Waves,
  Landmark,
} from "lucide-react";

export const FIRM = {
  name: "Halliday Architects",
  shortName: "Halliday Architects",
  address: "728 West Avenue, Suite A, Ocean City, NJ 08226",
  address1: "728 West Avenue, Suite A",
  address2: "Ocean City, NJ 08226",
  mailing1: "P.O. Box 186",
  mailing2: "Ocean City, NJ 08226",
  phone: "609.957.6789",
  phoneHref: "tel:6099576789",
  fax: "609.337.1758",
  email: "chris@hallidayarchitects.com",
  founded: 2013,
  tagline:
    "Residential architecture on the New Jersey shore, designed around the local vernacular and the way a house is actually lived in.",
};

/**
 * Headline figures, all from the practice's own Houzz profile
 * (houzz.com/pro/chris-halliday). Verified 2026-08-20. Nothing estimated.
 * If a remix of this project reuses this file, these numbers MUST be
 * replaced — they belong to Halliday Architects alone.
 */
export const STATS = [
  { figure: "9×", label: "Best of Houzz", detail: "Service, 2016 – 2024" },
  { figure: "5.0", label: "Client rating", detail: "From 43 reviews" },
  { figure: "10", label: "Shore communities", detail: "Ocean City to Atlantic City" },
] as const;

/** Memberships and licensure, from the principals' own listings. */
export const ACCREDITATIONS =
  "AIA member · LEED accredited · NCARB certified · Licensed in New Jersey and California";

/** The sequence a project moves through, in the client's language. */
export const HOW_WE_WORK = [
  {
    title: "Consultation",
    description:
      "We walk the site, look at what the zoning and flood maps allow, and talk through what you want the house to do.",
  },
  {
    title: "Design",
    description:
      "Sketches become plans, and plans become a set a builder can price and work from — reviewed with you at every stage.",
  },
  {
    title: "Approvals",
    description:
      "Code review, zoning submissions and permit documents are prepared and carried through the municipal process.",
  },
  {
    title: "Construction",
    description:
      "We stay involved on site, answering the questions that come up as the house is built.",
  },
] as const;

/** What building on a barrier island actually demands. */
export const COASTAL_NOTE =
  "Building on the shore brings its own requirements — flood elevations, wind exposure, salt air on every exposed material. These are considered from the first sketch rather than resolved late, and detailing and material choices are made for durability in a coastal environment.";

export const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://www.instagram.com/hallidayarchitects/" },
  { name: "Houzz", url: "https://www.houzz.com/pro/chris-halliday/halliday-architects" },
] as const;

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
};

// Services are the eleven the practice lists under "Services Provided" on its
// public Houzz profile (houzz.com/pro/chris-halliday). Verified 2026-08-24.
// Descriptions stay factual — nothing here is invented.
export const SERVICES: Service[] = [
  {
    title: "Architectural Design",
    description: "Full architectural design for new houses, additions and renovations, from first sketch to permit set.",
    icon: DraftingCompass,
  },
  {
    title: "Building Design",
    description: "Buildings designed around their site, their structure and the codes that govern them.",
    icon: Building2,
  },
  {
    title: "Home Remodeling",
    description: "Whole-house remodels that rework how an existing house lives.",
    icon: Hammer,
  },
  {
    title: "Custom Homes",
    description: "One-of-a-kind houses designed for their site and for the family who will live in them.",
    icon: Home,
  },
  {
    title: "New Home Construction",
    description: "New houses taken from the first site conversation through construction.",
    icon: HardHat,
  },
  {
    title: "Home Additions",
    description: "Additions and second storeys that read as part of the original house.",
    icon: SquarePlus,
  },
  {
    title: "Kitchen Design",
    description: "Kitchens planned with the architecture — layout, cabinetry, lighting and finishes.",
    icon: ChefHat,
  },
  {
    title: "Kitchen Remodeling",
    description: "Existing kitchens reconfigured around how the household cooks and gathers.",
    icon: UtensilsCrossed,
  },
  {
    title: "Green Building",
    description: "Energy performance and durable, efficient construction resolved as part of the design.",
    icon: Leaf,
  },
  {
    title: "Pool House Design & Construction",
    description: "Pool houses and outdoor structures designed together with the main house.",
    icon: Waves,
  },
  {
    title: "Home Restoration",
    description: "Older shore homes measured, understood and carefully restored.",
    icon: Landmark,
  },
];
