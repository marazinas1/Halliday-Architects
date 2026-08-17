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
  phone: "609.957.6789",
  phoneHref: "tel:6099576789",
  fax: "609.337.1758",
  email: "chris@hallidayarchitects.com",
  // TODO: replace with real positioning copy from the client.
  tagline: "An architecture practice in Ocean City, New Jersey.",
};

export type Service = {
  title: string;
  description: string;
  detail: string;
};

export const SERVICES: Service[] = [
  {
    title: "Custom Homes",
    description:
      "Bespoke residences designed for the way you live — from primary residences to coastal retreats.",
    detail:
      "We work with you from first sketch through construction administration, resolving every plan for how it will be built and how it will hold up to the coastal environment.",
  },
  {
    title: "Renovations & Additions",
    description:
      "Thoughtful renovations and additions that respect the character of a home while elevating how it works.",
    detail:
      "Whole-home renovations, additions, and careful restorations — designed with the same rigour as our new construction, and with respect for the home that is already there.",
  },
  {
    title: "Multi-Family & Mixed Use",
    description:
      "Duplex, multi-family, and mixed-use buildings designed for their street and their site.",
    detail:
      "From zoning and feasibility through permit documents, we manage the approvals process and produce drawings contractors can build from without guesswork.",
  },
  {
    title: "Sustainable Design",
    description:
      "LEED-accredited design focused on comfort, durability, and long-term performance.",
    detail:
      "Envelope, orientation, daylight, and mechanical strategy considered together, so the building performs quietly in the background for decades.",
  },
];

export type TeamMember = {
  name: string;
  role: string;
  credentials?: string;
  bio: string;
};

// TODO: temporary — moves to the database in a later phase. Bios pending from the client.
export const TEAM: TeamMember[] = [
  { name: "Chris Halliday", role: "Principal", credentials: "RA, LEED AP", bio: "" },
  { name: "Shannon Halliday", role: "Principal", credentials: "RA, LEED AP", bio: "" },
  { name: "Brett Hagerty", role: "Draftsman", bio: "" },
  { name: "Christy Hill", role: "Studio Designer", bio: "" },
  { name: "Samantha Cozzi", role: "Studio Designer", bio: "" },
];
