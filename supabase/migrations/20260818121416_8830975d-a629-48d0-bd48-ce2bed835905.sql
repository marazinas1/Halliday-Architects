CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blog categories" ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert blog categories" ON public.blog_categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update blog categories" ON public.blog_categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete blog categories" ON public.blog_categories FOR DELETE TO authenticated USING (public.is_admin());

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text NOT NULL DEFAULT '',
  cover_path text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_published_at_idx ON public.blog_posts (published, published_at DESC);
CREATE INDEX blog_posts_category_id_idx ON public.blog_posts (category_id);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();