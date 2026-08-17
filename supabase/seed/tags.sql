-- Starter design-element tags used for filtering project imagery.
-- Seed data only — never place this in a migration.
-- Run manually against the database when setting up a fresh environment.

INSERT INTO public.tags (name, slug, sort_order) VALUES
  ('Kitchens',       'kitchens',       10),
  ('Bathrooms',      'bathrooms',      20),
  ('Staircases',     'staircases',     30),
  ('Decks',          'decks',          40),
  ('Porches',        'porches',        50),
  ('Facades',        'facades',        60),
  ('Interiors',      'interiors',      70),
  ('Lighting',       'lighting',       80),
  ('Built-ins',      'built-ins',      90),
  ('Outdoor Living', 'outdoor-living', 100)
ON CONFLICT (slug) DO NOTHING;
