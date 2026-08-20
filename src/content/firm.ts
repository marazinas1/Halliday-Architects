/**
 * Shared Halliday Architects content — static firm facts and copy used
 * across the multi-page site.
 */

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
  detail: string;
};

// Services reflect the work the practice lists publicly (architectural design,
// custom homes, additions, remodelling and restoration, kitchens, green
// building). Descriptions stay factual — nothing here is invented.
export const SERVICES: Service[] = [
  {
    title: "Architectural Consultation",
    description: "Early conversations about a site, a property, or an idea for a home.",
    detail:
      "Before drawings begin we look at the site, the zoning and the flood requirements, so the first decisions are made with the constraints already understood. Often this is the conversation that decides whether to build new, add on, or buy at all.",
  },
  {
    title: "New Homes",
    description: "Custom houses designed for their site and for the family who will live in them.",
    detail:
      "Each house responds to the local vernacular, to current building technology, and to the functional relationships between its spaces. Design is led personally by a principal, from first sketch to the drawings a builder works from.",
  },
  {
    title: "Additions & Renovations",
    description: "Additions, whole-house renovations and the restoration of older shore homes.",
    detail:
      "Existing houses are measured and understood before anything is proposed, so new work reads as part of the house rather than an attachment to it.",
  },
  {
    title: "Interiors & Kitchens",
    description: "Interior layouts, kitchens and the detailing that follows the architecture.",
    detail:
      "Cabinetry, millwork, lighting and finishes are drawn alongside the plan, so the inside of the house is resolved rather than left to be decided on site.",
  },
  {
    title: "Code Analysis & Permits",
    description: "Building and zoning code review, permit drawings and municipal coordination.",
    detail:
      "Requirements are checked against the design as it develops rather than after the fact, and we prepare and carry the submission through the approvals process.",
  },
  {
    title: "Construction Administration",
    description: "Staying with the project through construction.",
    detail:
      "We review shop drawings, visit the site and answer the questions that come up during the build, so what is drawn is what gets made.",
  },
];
