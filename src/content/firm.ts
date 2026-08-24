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

// Homepage services preview — six grouped services that summarise the full
// eleven listed on /services. Grouped so the homepage reads cleanly rather
// than repeating four near-identical "new build" keywords.
export const HOMEPAGE_SERVICES: Service[] = [
  {
    title: "New homes",
    description:
      "Custom houses designed for their site and for the family who will live in them, taken from the first sketch through construction.",
    icon: Home,
  },
  {
    title: "Additions & renovations",
    description:
      "Additions, second storeys and whole-house renovations, worked out around what is already standing.",
    icon: SquarePlus,
  },
  {
    title: "Restoration",
    description:
      "Older shore homes measured, understood and carefully restored, keeping the character that makes them worth keeping.",
    icon: Landmark,
  },
  {
    title: "Kitchens & interiors",
    description:
      "Interior layouts, kitchens and the cabinetry, lighting and finishes that follow the architecture.",
    icon: ChefHat,
  },
  {
    title: "Pool houses & outbuildings",
    description:
      "Pool houses, cabanas and outdoor structures designed together with the main house rather than added on.",
    icon: Waves,
  },
  {
    title: "Sustainable design",
    description:
      "Energy performance and durable, efficient construction resolved as part of the design, from a LEED accredited practice.",
    icon: Leaf,
  },
];

/**
 * The /services page. Six groups matching the homepage preview, each with a
 * paragraph describing the work and the Houzz service names it covers.
 *
 * The paragraphs are a first draft written from what the practice states
 * publicly (its stated approach to the local vernacular, both principals'
 * LEED accreditation, and the shore conditions the work is subject to).
 * They describe the nature of the work only — no fees, no timescales, no
 * commitments. Chris and Shannon should review and rewrite in their own
 * words before launch.
 */
export type ServiceGroup = {
  title: string;
  icon: LucideIcon;
  body: string;
  includes: string[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: "New homes",
    icon: Home,
    body: "A new house on the shore begins with what the site allows — the zoning envelope, the flood elevation, and the way light moves across the lot through the day. The plan then develops around how the family intends to live in it, and the drawings are worked up into a set a builder can price and build from. Both principals stay with the project from that first site visit through construction.",
    includes: ["Architectural Design", "Building Design", "Custom Homes", "New Home Construction"],
  },
  {
    title: "Additions & renovations",
    icon: SquarePlus,
    body: "An addition has to belong to the house it joins. We measure and understand what is already standing — its structure, its proportions, and the quirks that come with an older shore home — before drawing anything new. The aim is a finished house that reads as one building rather than an original with something attached.",
    includes: ["Home Additions", "Home Remodeling"],
  },
  {
    title: "Restoration",
    icon: Landmark,
    body: "Older shore houses carry details worth keeping: porch proportions, the rhythm of the windows, trim profiles that are no longer standard. Restoration begins by recording what is there, then deciding with the owner what should be preserved, what can be repaired, and what has to be replaced.",
    includes: ["Home Restoration"],
  },
  {
    title: "Kitchens & interiors",
    icon: ChefHat,
    body: "Kitchens are planned with the architecture rather than fitted into it afterwards, so the layout, cabinetry, lighting and finishes are resolved as part of the plan. That includes existing kitchens reconfigured around how a household actually cooks and gathers.",
    includes: ["Kitchen Design", "Kitchen Remodeling"],
  },
  {
    title: "Pool houses & outbuildings",
    icon: Waves,
    body: "Pool houses, cabanas and outdoor structures are designed together with the main house so that materials, roof lines and proportions agree. Working them out at the same time also keeps the site plan, setbacks and lot coverage under control.",
    includes: ["Pool House Design & Construction"],
  },
  {
    title: "Sustainable design",
    icon: Leaf,
    body: "Both principals are LEED accredited professionals, and energy performance is treated as part of the design rather than a specification added at the end. On the shore that also means durability: salt air, wind exposure and flood elevation shape the construction as much as the comfort targets do.",
    includes: ["Green Building"],
  },
];
