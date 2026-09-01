# Bringing the site to life: hero motion, scroll reveals, smaller Instagram mark

Three changes, smallest first.

## 1. Instagram mark

Reduce the footer icon from 40 back down to 30, keeping the 56px touch target. A quiet mark, not a button.

## 2. Scroll reveals across the site

The homepage currently renders every block at full opacity on load — the `Reveal` component exists and is used on Projects, Services and About, but not on the homepage photo wall, the manifesto line, or the three navigation tiles.

- Wrap each homepage block in `Reveal` with a short stagger, so photographs and text rise into place as you scroll rather than being there already.
- Photographs get a slightly longer, slower fade than text, and images fade in only once decoded — no half-loaded flash, no layout shift (heights are already fixed).
- Audit the remaining public pages (Projects, Services, About, Contact, Blog, project detail) and add reveals to any section still missing one, using the same timing so the rhythm is identical everywhere.
- Reduced-motion and no-JavaScript paths stay as they are: everything visible, nothing animated.

## 3. A living hero

Rather than copying the ASP Architects single-image slideshow, the hero keeps this site's own idea — the four-frame photo wall — but stops being frozen:

- **The top frame becomes a slow slideshow.** It cycles through the homepage hero image and the project cover photographs, one every 7 seconds, cross-fading over 1.5s. No arrows, no dots, no captions — it should read as the building being looked at from different angles, not as a carousel.
- **Each frame drifts.** While a photograph is on screen it slowly scales from 1.0 to about 1.06 with a small directional pan, and the direction alternates between slides so the movement never feels mechanical. Ken Burns, but at a pace you notice only if you stay.
- **The lower frames breathe too, more quietly.** The two mid-size frames and the closing dark frame get a very slow drift that runs only while they are in the viewport, at roughly half the hero's amplitude — enough that scrolling past feels alive, not enough to distract.
- **Restraint rules.** Motion pauses when the tab is hidden and when the frame is off-screen; the whole system is disabled under `prefers-reduced-motion`, where the hero shows a single still photograph.

Images come from the same source as today — the admin hero image plus published project covers — so nothing is hardcoded and the client keeps control.

## Technical notes

- Files: `src/components/SocialLinks.tsx`, `src/pages/Index.tsx`, a new `src/components/KenBurnsFrame.tsx` (or an extension of the existing `PhotoFrame`) holding the slideshow and drift logic, plus small `Reveal` additions to public page sections.
- Slideshow state uses a single interval with two stacked `<img>` layers cross-fading via opacity; only the two active layers are mounted, the rest preload lazily.
- Drift is CSS transform animation with `will-change: transform`, gated behind `motion-safe:` and an IntersectionObserver so off-screen frames do not animate.
- No database, admin or content changes.

## Verification

- Homepage at 1280px and 390px: hero cycles smoothly, no jump at the loop point, no layout shift.
- Scrolling the homepage shows blocks arriving rather than being pre-drawn.
- With reduced motion enabled the page is fully static and fully visible.
