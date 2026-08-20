# Homepage: full-height hero, credentials, areas served, rhythm

The homepage structure is in place but reads as scaffolding. This brings it up to the standard of the work it presents, following the StageHomy visual language already adopted across the site.

## 1. Full-height hero

Rebuild the hero in `src/pages/Index.tsx` to the StageHomy HeroSection pattern:

- Full viewport height (`min-h-screen`, with a dynamic-viewport fallback for mobile browser chrome) so only the hero is visible on load and the next section arrives on scroll.
- The photograph fills the frame behind a **dual overlay**: a dark top-to-bottom gradient for nav legibility plus a stronger bottom gradient behind the copy.
- A small badge line above the headline (uppercase, hairline border, translucent), the headline in white set large via `heading-display`, one supporting line beneath, then the two existing buttons.
- A **backdrop-blurred band** sitting over the lower part of the image, holding the credentials from Part 2.
- The hero image keeps coming from `site_settings` (`heroImageUrl`) and the admin preview path stays intact. Nothing is hardcoded back. With no image set, the hero still renders full height on the plain surface with dark text and no scrim.

## 2. Credentials band

The blurred band carries three facts only, each marked in a code comment as sourced from the practice's Houzz profile so they can be checked or updated:

- Best of Houzz winner, 2016-2022
- 5.0 from 43 reviews on Houzz
- Registered architects, RA and LEED AP

Three columns on desktop, stacked on mobile, with hairline dividers. No invented project counts or years in business. On mobile the band sits below the copy rather than over it, so it never obscures the photograph.

## 3. Areas served

A new quiet section, `src/components/sections/AreasServed.tsx`, placed after Selected work: a short label, one line of framing copy, and the communities set as a typographic list — Ocean City, Sea Isle City, Longport, Margate City, Somers Point, Brigantine, Linwood, Marmora, Strathmere, Atlantic City. A multi-column list, not a map, not cards. Source noted in a comment. Good for local search and answers "do they cover my town" instantly.

## 4. Section rhythm

Alternate the backgrounds down the page so it stops reading as one continuous grey:

```text
Hero            photograph / dark
Introduction    white
Selected work   sand
Services        white
Areas served    sand
Studio note     white
Practice line   ink (unchanged)
Closing CTA     white
```

This swaps `ServicesPreview` off sand, puts `SelectedWork` and `AreasServed` on sand, and changes the closing `CTASection` variant from sand to light. Hairline dividers between same-coloured neighbours only, so the rules do not fight the colour changes. Section padding stays on the shared rhythm scale.

## Technical notes

- Files: `src/pages/Index.tsx` (hero + credentials band + section order), new `src/components/sections/AreasServed.tsx`, small background-class edits in `SelectedWork.tsx` and `ServicesPreview.tsx`.
- No database, hook or admin changes. `useSiteSettings` / `resolveHomepage` and the `/admin/preview/homepage` path are untouched.
- Areas served and credentials copy live as local constants with sourcing comments, not in the database — they are firm facts, not client-edited content.
- All colours through existing tokens (`ink`, `paper`, `sand`, `background`, `line`); no hardcoded hex or `text-white`.

## Verification

- Hero fills the viewport at 1280px and 390px, headline legible over the photograph in both.
- Credentials band readable and not covering the focal area of the image; stacks below the copy on mobile.
- Changing the hero image in the admin still changes the homepage; clearing it falls back cleanly.
- Scrolling shows alternating surfaces rather than one grey run.
