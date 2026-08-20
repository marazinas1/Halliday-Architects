/**
 * Single source of truth for the site's vertical rhythm and horizontal measure.
 *
 * Every section pulls its spacing from here so the whole site's rhythm can be
 * tuned from one file. Values are generous by design — this is a portfolio
 * site and crowding reads as cheap.
 */

/**
 * Mirrors the StageHomy system 1:1:
 *   .section-padding  → py-24 md:py-32
 *   .container-wide   → max-w-[1440px] mx-auto px-6 lg:px-8
 */
export const sectionPadding = {
  /** Standard section rhythm. */
  base: "py-24 md:py-32",
  /** Tighter section, used when two related bands sit next to each other. */
  tight: "py-40 md:py-48",
  /** Expansive section, for statements and closing calls to action. */
  loose: "py-32 md:py-40",
} as const;

/** Horizontal gutters applied to every container. */
export const gutter = "px-6 lg:px-8" as const;

/** Container widths. */
export const container = {
  /** Default content width for grids and galleries. */
  wide: `max-w-[1440px] mx-auto ${gutter}`,
  /** Editorial width for prose-led sections. */
  content: `max-w-5xl mx-auto ${gutter}`,
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
