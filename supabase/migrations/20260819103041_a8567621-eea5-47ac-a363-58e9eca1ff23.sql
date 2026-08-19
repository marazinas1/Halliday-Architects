DO $$
DECLARE pid uuid;
BEGIN
INSERT INTO public.projects (slug, title, headline, tagline, description, story, client_brief, project_type, location_city, location_state, published, sort_order, specs, features)
VALUES (
 '11605-paradise-drive',
 '11605 Paradise Drive',
 'A bayfront house arranged around the marsh view',
 'Stone Harbor, New Jersey',
 'A shingled bayfront house with white siding, a mahogany entry and a standing-seam metal roof. The living level is one open room facing the water, and the bay side stacks a covered porch, a pool terrace and a private dock beneath an upper sun deck.',
 'The plan puts the whole living level on one floor facing the bay: kitchen, dining and living run together beneath a shiplap and beamed ceiling, with tall windows and glass doors along the water wall. Outside that wall, a deep porch with a cedar ceiling and an outdoor kitchen extends the room into the weather, then steps down to the pool terrace and the dock. Above, a sun deck set into the roof line takes the long view across the marsh. White cabinetry is paired with rift oak and heavily veined marble so the interior stays quiet against the water.',
 'A year-round bayfront family house: one open living level facing the water, generous covered outdoor rooms, a pool terrace and dock, and an upper deck for the marsh view.',
 'new_build', 'Stone Harbor', 'NJ', true, 2,
 '[{"icon":"kitchen","title":"Open kitchen and dining","description":"Two marble-topped rift oak islands, white cabinetry and a full-height range wall opening to the dining and living rooms."},
   {"icon":"deck","title":"Cedar-ceiling porch","description":"A deep covered porch with an outdoor kitchen and glass rail, facing the bay."},
   {"icon":"pool","title":"Pool terrace and dock","description":"A pool set into a stone terrace with a boardwalk to the private dock."},
   {"icon":"deck","title":"Upper sun deck","description":"A sheltered deck cut into the roof line with built-in seating and a long marsh view."}]'::jsonb,
 '["White shingle siding with mahogany entry","Standing-seam metal roofing","Open one-level living plan","Shiplap and beamed ceilings","Rift oak and white lacquered cabinetry","Marble islands and surrounds","Cedar-ceiling covered porch with outdoor kitchen","Pool terrace and private dock","Upper sun deck with built-in seating"]'::jsonb
) RETURNING id INTO pid;

INSERT INTO public.project_images (project_id, storage_path, category, sort_order, is_cover, alt_text) VALUES
 (pid,'11605-paradise-drive/card/c72b0c47-7c4b-4c1d-83ff-f1cbe2b0c4a1.webp','hero',0,true,'Front elevation with mahogany entry door and white shingle siding'),
 (pid,'11605-paradise-drive/gallery/bb459d49-d491-48fe-b8f4-34991319e91c.webp','gallery',1,false,'Bay elevation with stacked porches above the pool terrace'),
 (pid,'11605-paradise-drive/gallery/2ee7e96b-8159-4a22-8c56-44d9278dfbad.webp','gallery',2,false,'Aerial view of the covered porch, pool terrace and metal roof'),
 (pid,'11605-paradise-drive/gallery/b4855c59-32da-4441-a993-c4fa98aea720.webp','gallery',3,false,'Private dock and boat lift on the bay'),
 (pid,'11605-paradise-drive/gallery/0fb0a7a0-937f-4e13-b8c3-d9cb49a09c90.webp','gallery',4,false,'Open living level seen from the kitchen toward the water wall'),
 (pid,'11605-paradise-drive/gallery/2b52771f-6b37-4012-ac54-394f9e86ec70.webp','gallery',5,false,'Marble-topped rift oak island beneath glass pendants'),
 (pid,'11605-paradise-drive/gallery/4b27fdd6-7a33-4402-aac4-679c64c1c508.webp','gallery',6,false,'Range wall with marble backsplash and oak hood surround'),
 (pid,'11605-paradise-drive/gallery/d2423c83-ca65-412f-987e-a86a0bc9cd23.webp','gallery',7,false,'Dining table beside glass doors to the porch'),
 (pid,'11605-paradise-drive/gallery/2d4a0d91-bded-464f-a994-6b9479614849.webp','gallery',8,false,'Living room with vaulted shiplap ceiling and fireplace'),
 (pid,'11605-paradise-drive/gallery/32373580-767d-4058-981c-97614057cb00.webp','gallery',9,false,'Covered porch with cedar ceiling looking over the bay'),
 (pid,'11605-paradise-drive/gallery/dfae991a-ee6f-4be3-a8f4-7de66f311fa3.webp','gallery',10,false,'Outdoor kitchen and dining under the cedar porch ceiling'),
 (pid,'11605-paradise-drive/hero/ed2d32da-f5ec-4da1-9c4f-165ae60b6193.webp','gallery',11,false,'Upper sun deck with built-in seating and marsh view'),
 (pid,'11605-paradise-drive/gallery/27ebad45-dd44-46be-ace8-2dafed59c73b.webp','gallery',12,false,'Sun deck seating set into the shingled roof line'),
 (pid,'11605-paradise-drive/gallery/e9d65c44-875a-4251-8520-8eff5d892305.webp','gallery',13,false,'Long view along the upper deck toward the water'),
 (pid,'11605-paradise-drive/gallery/5ff3a135-1379-47ed-aead-bccd1ea17992.webp','gallery',14,false,'Primary bedroom with canopy bed and marble fireplace'),
 (pid,'11605-paradise-drive/gallery/5b276740-0f8b-43cb-9d72-7fc59b3fdd07.webp','gallery',15,false,'Primary bathroom with oak vanity and glass shower');

INSERT INTO public.project_tags (project_id, tag_id)
SELECT pid, id FROM public.tags WHERE slug IN ('kitchens','bathrooms','decks','porches','facades','interiors','lighting','outdoor-living');
END $$;