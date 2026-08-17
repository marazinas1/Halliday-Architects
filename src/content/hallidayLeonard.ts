/**
 * Shared Halliday Leonard content — copy used across the multi-page site.
 */

export const FIRM = {
  name: "Halliday-Leonard General Contractors",
  shortName: "Halliday Leonard",
  address1: "700 Haven Avenue",
  address2: "Ocean City, NJ 08226",
  phone: "609.398.5737",
  phoneHref: "tel:6093985737",
  email: "Info@HallidayLeonardInc.com",
  tagline:
    "Custom homes, developments, and joint ventures. Delivering the highest-quality custom homes in the Ocean City, New Jersey area for over 40 years.",
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
      "Bespoke residences built on your lot — from primary residences to vacation retreats — designed and executed with four decades of craftsmanship.",
    detail:
      "We work alongside you and your architect from first sketch to final walkthrough. Every plan is reviewed for constructability, every material selected for how it will hold up to salt air and coastal seasons, and every trade is one we have worked with for years.",
  },
  {
    title: "Developments",
    description:
      "Multi-home and multi-family developments delivered on time and on budget, with a steady hand from acquisition through final inspection.",
    detail:
      "From lot acquisition and entitlement through permitting, construction, and certificate of occupancy, we manage the entire development timeline with schedules and budgets our partners can plan around.",
  },
  {
    title: "Joint Ventures",
    description:
      "Trusted partnerships with landowners, investors, and architects to bring ambitious coastal projects to life — from concept through completion.",
    detail:
      "We partner with landowners and investors who want an experienced builder with real skin in the game. Our long-standing relationships across Ocean City give every venture a head start.",
  },
  {
    title: "Renovations",
    description:
      "Thoughtful renovations and additions that respect the character of your home while elevating its quality, comfort, and long-term value.",
    detail:
      "Whole-home renovations, additions, and careful restorations — executed with the same crews and the same standards as our new construction, and with respect for the home you already love.",
  },
];

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export const TEAM: TeamMember[] = [
  {
    name: "Scott Halliday",
    role: "Founding Partner",
    bio: "Forty years of building the finest custom homes in Ocean City.",
  },
  {
    name: "Keith Leonard",
    role: "Founding Partner",
    bio: "A steady hand on every project — on time, on budget, on point.",
  },
  {
    name: "Scott Halliday Jr.",
    role: "Partner",
    bio: "Carrying the Halliday craftsmanship into the next generation of coastal builds.",
  },
  {
    name: "Matt Leonard",
    role: "Partner",
    bio: "Leading the development side with an eye for detail and execution.",
  },
];

export type Testimonial = {
  /** Short pull quote shown in the carousel. */
  quote: string;
  author: string;
  detail: string;
  /** Full letter, revealed via "Read more". */
  full?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Polite, efficient, and diligent.",
    author: "Kathie J.",
    detail: "Ocean City, NJ",
    full: `We are so grateful to have chosen Keith Leonard as the builder of our new Ocean City home! From the initial stages of planning to the day we received our occupancy permit, Keith's professional work ethic was evident throughout the entire process. He listened attentively to our requests, supplied necessary guidance when needed, paid attention to every detail, and was never too busy to return a phone call or reply to an email.

Keith and his son, Matt, are unflappable, remaining calm and providing reassurances that our desires would be achieved. His crews demonstrated their expertise while simultaneously remaining polite, efficient, and diligent. Our friends are amazed at their quality of workmanship so evident throughout our new home.

Keith and crew, thank you for making a life-long dream become a reality, and for providing many laughs along the way! It was an absolute pleasure to work with you.`,
  },
  {
    quote: "The follow up was exceptional…",
    author: "Cliff & Linda Montgomery",
    detail: "Ocean City, NJ",
    full: `We have had a dream to own in Ocean City, NJ for years. Halliday-Leonard made it a reality! We looked at dozens of homes. By far, the best was the Halliday-Leonard home! When we found it, it was just framed. We had the opportunity to select our cabinets, flooring and countertops with Scott Halliday's help! He kept us posted during construction, responded to our questions and settled on time!

After settlement, the team was so responsive we were overwhelmed! Any questions or concerns were handled immediately! The follow up was exceptional and so conscientious! From the landscaping to the trim, every detail was complete and beautifully finished. We completely recommend their homes to anyone looking for a warm, inviting, exceptional retreat! Don't wake us up from our dream!`,
  },
  {
    quote: "No hassles or headaches; you made it an easy ride.",
    author: "Beth & Sal Raddi",
    detail: "Ocean City, NJ",
    full: `We wanted to let you know how much we appreciate the commitment you gave us while planning and building our house. You made our experience very pleasurable. No hassles or headaches; you made it an easy ride. All of the people we dealt with were more than helpful and have the utmost respect for you.

We absolutely love our beautiful home, and are looking forward to spending many happy years here. We cannot thank you enough for all of your talents, patience and just being a kind and caring person. Thank you for making our dream come true.

We wish you continual success in the future.`,
  },
  {
    quote: "Meets our needs perfectly.",
    author: "Timmy, Denise & Dierdre",
    detail: "Ocean City, NJ",
    full: `Thank you for the great job building our new home on 1st Street. It is beautiful and meets our needs perfectly. We are so happy to be able to continue living where we created so many childhood memories.

We really appreciate your hard work, expertise, and the time you spent making sure we were treated like family.`,
  },
  {
    quote: "The end product was exactly what we wanted.",
    author: "A Halliday-Leonard family",
    detail: "Ocean City, NJ",
    full: `Now that our family home is completed, we wanted to send you this letter of appreciation.

From the day we first spoke informally outside your office regarding our budget to the day you handed us the keys, you always showed great concern regarding our wishes and needs. You always listened to us and treated us with concern and respect. You were willing to make adjustments as we went along so that the end product was exactly what we wanted.

The sub-contractors, with whom we spoke, were personable and attentive to our ideas and needs. You made the process of constructing a new home a pleasurable experience. Both of us are extremely pleased with the result.`,
  },
  {
    quote: "The house looks AMAZING!",
    author: "The Geraces",
    detail: "Ocean City, NJ",
    full: `Dear Everyone,

Thanks so much for all your work. The house looks AMAZING!

Thanks again!`,
  },
];
