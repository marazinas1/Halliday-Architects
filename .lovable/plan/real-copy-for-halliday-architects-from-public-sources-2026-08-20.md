# Real copy for Halliday Architects, from public sources

Replace the placeholder wording across the site with copy grounded in what the practice already publishes about itself, and add a testimonials module the client can fill in.

## What the research found

Sources: hallidayarchitects.com, the practice's Houzz profile, AIA-NJ firm search, Ecohome directory, LinkedIn.

- Positioning, in the firm's own words on Houzz: "a team of talented individuals that approaches design as a response to the local vernacular, new technologies and the functional relationships of the spaces."
- Services listed publicly: architectural design, custom homes, home additions, home remodeling and restoration, kitchen design, pool house design, green building.
- Credentials: AIA member, LEED accredited, NCARB certified, licensed in New Jersey and California, Ocean City Use of Technology Award, Best of Houzz awards.
- Principals: Christopher Halliday (AIA, LEED AP, NCARB) — M.Arch, Northeastern; practice founded 2013; earlier work at Winick Architects and AB design studio, plus post-fire rebuild consulting in Santa Barbara. Shannon Halliday (Architect, LEED AP).
- Team: Chris and Shannon (Principals), Brett Hagerty (Draftsman), Christy Hill and Samantha Cozzi (Studio Designers).
- Areas served: Ocean City, Sea Isle City, Longport, Margate City, Somers Point, Brigantine, Linwood, Marmora, Strathmere, Atlantic City — already on the site and confirmed correct.
- Contact: 728 West Avenue Suite A, Ocean City NJ 08226; mailing P.O. Box 186; T 609.957.6789, F 609.337.1758. The mailing address is new to the site.
- No client review text is publicly readable — the Houzz profile is suspended — so quotes must come from the client.

## Copy changes

**Firm content module** — rewrite the positioning line and expand the services list from four generic placeholders to the six the practice actually offers: architectural consultation, architectural design of new homes, additions and renovations, interiors and kitchens, building code and permit coordination, construction administration. Each gets a short factual description and a longer detail paragraph. Add the mailing address.

**Homepage** — new hero headline and subline (written into the database so the client can still edit them), a rewritten introduction built on the "local vernacular, new technologies, functional relationships" idea, and the services preview picking up the new six-item list. Sustainability stays a light touch: LEED accreditation and energy-conscious coastal building, no Passive House certification claim.

**About** — replace the placeholder paragraphs with the real story: founded 2013, led by two registered architects, principal-led from first sketch through construction administration, work rooted in the shore vernacular and current building science. Add a short "how we work" sequence — consultation, design, approvals, construction.

**Services page** — full descriptions for all six services, plus a short paragraph on the coastal-specific work that shore projects require: flood elevation, wind exposure, salt-air durability.

**Team page** — role labels corrected and a factual bio for Christopher covering education, licensure and practice history. Shannon and the studio designers get short factual lines only; anything more waits for their own words.

**Contact page** — add fax and mailing address alongside the existing details.

**Credentials band** — replace the current Houzz review-score claim, which can no longer be verified now that the profile is suspended, with claims that can be: AIA member, LEED accredited and NCARB certified, licensed in NJ and CA, Ocean City Use of Technology Award, practising on the shore since 2013.

## Testimonials module

A `testimonials` table (quote, author name, optional project or location, sort order, published flag) with the standard RLS and grants, plus admin CRUD at `/admin/testimonials` following the pattern already used for team members. A quiet testimonials section on the homepage and About page renders only when at least one published quote exists, so it stays invisible until Chris adds real ones. No quotes are invented or seeded.

## Technical notes

- Copy lives in `src/content/firm.ts`; homepage hero and intro are written to `site_settings` so they remain client-editable through `/admin/homepage`.
- The services array gains two entries, so `ServicesPreview` and `ServicesGrid` move from a 4-column to a 3-column desktop grid.
- Testimonials follow the existing hooks and admin conventions (`useAdminTeam` as the model) and reuse the same list and reorder UI patterns.
- SEO titles and descriptions on home, about, services, team and contact updated to match the new copy; the service list in `public/llms.txt` refreshed.
- The `noindex` tag and the crawler block stay in place — this is still the temporary domain.