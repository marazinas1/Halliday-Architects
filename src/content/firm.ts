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

// PLACEHOLDER COPY — awaiting the client's own words.
// Service names follow the practice's own Google Business listing; descriptions
// are deliberately short and factual. Do not add services we cannot verify.
export const SERVICES: Service[] = [
  {
    title: "Architectural Consultation",
    description: "Early conversations about a site, a property, or an idea for a home.",
    detail:
      "We review the site and what is possible on it before drawings begin, so decisions are made with the constraints already understood.",
  },
  {
    title: "Architectural Design",
    description: "Design of new homes, renovations, and additions.",
    detail:
      "From first sketches through drawings a builder can work from, each project is led personally by a principal.",
  },
  {
    title: "Building Code Analysis",
    description: "Review of a project against applicable building and zoning codes.",
    detail:
      "Requirements are checked against the design as it develops, rather than after the fact.",
  },
  {
    title: "Permit Coordination",
    description: "Preparation and coordination of drawings for permit approval.",
    detail:
      "We assemble the documents required for submission and stay involved through the approvals process.",
  },
];
