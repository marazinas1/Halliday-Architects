# Unify public-site buttons and CTAs

## Scope
Standardize every public-facing text action to the CTA pattern already used at the bottom of the Projects page: uppercase compact label, thin underline, right arrow, and a subtle arrow shift on hover. Admin controls, navigation links, filters, gallery/image buttons, and icon-only controls will keep their purpose-specific behavior.

## Changes
- Make the shared `link-inline` style the canonical Projects CTA treatment, including type weight, tracking, underline spacing, focus state, and hover motion.
- Update `SectionLink` and `CTASection` to use that same treatment on white, sand, and ink backgrounds.
- Replace one-off public CTA link styles in Projects, empty states, project/blog fallback states, and journal links with the shared pattern.
- Restyle the Contact form submit action to the same visual language while preserving loading, disabled, validation, and submission behavior.
- Keep project filters as filter tabs, mobile menu controls as icons, and gallery/lightbox controls as image controls rather than disguising them as CTAs.

## Verification
- Audit public source files again to ensure no competing CTA button styles remain.
- Check representative pages on desktop and mobile: Projects, About/Services shared CTA, Contact form, Blog, and a project detail page.
- Confirm no horizontal overflow, interaction regressions, runtime errors, or build errors.

## Technical details
- No database, content, routing, admin, or dependency changes.
- Reuse semantic color tokens and existing Tailwind/design-system utilities only.
