/**
 * Single source of truth for the site's vertical rhythm and horizontal measure.
 *
 * Every section pulls its spacing from here so the whole site's rhythm can be
 * tuned from one file. Values are generous by design — this is a portfolio
 * site and crowding reads as cheap.
 */

/**
 * Two widths, one band padding — the alignment system of the v6 homepage.
 *   grid    1440px  → every grid (work, services, process, footer, nav)
 *   measure 56rem   → all centered prose
 *   people  76rem   → the one exception: the principals' portraits
 */
export const sectionPadding = {
  /** Standard band rhythm — 6rem, as in the reference layout. */
  base: "py-16 md:py-24",
  /** Tighter band, used when two related bands sit next to each other. */
  tight: "py-12 md:py-16",
  /** Expansive band, for statements and closing calls to action. */
  loose: "py-20 md:py-28",
} as const;

/** Horizontal gutters applied to every container. */
export const gutter = "px-6 md:px-8" as const;

/** Container widths. */
export const container = {
  /** Grid width — every grid and the page chrome. */
  wide: `max-w-[1440px] mx-auto ${gutter}`,
  /** Reading measure for centered prose. */
  content: `max-w-[56rem] mx-auto ${gutter}`,
  /** The portraits' exception width. */
  people: `max-w-[76rem] mx-auto ${gutter}`,
  /** Narrow measure for single-column reading. */
  narrow: `max-w-3xl mx-auto ${gutter}`,
  /** Unconstrained, for full-bleed imagery. */
  full: `w-full ${gutter}`,
} as const;


/** Gaps between elements inside a section. */
export const gap = {
  /** Between grid or card items. */
  grid: "gap-10 lg:gap-14",
  /** Between the two halves of a split layout. */
  split: "gap-14 lg:gap-24",
  /** Between stacked blocks of copy. */
  stack: "space-y-6",
} as const;

/** Space below a section's heading block, before its content. */
export const headingSpacing = "mb-16 lg:mb-20" as const;

export const rhythm = {
  sectionPadding,
  container,
  gutter,
  gap,
  headingSpacing,
} as const;

export default rhythm;
