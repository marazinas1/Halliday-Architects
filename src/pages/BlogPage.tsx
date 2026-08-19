import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import PostCard from "@/components/blog/PostCard";
import { usePublishedPosts } from "@/hooks/usePublicBlog";
import { container, gap, sectionPadding } from "@/lib/rhythm";

const ALL = "__all__";

const BlogPage = () => {
  const { data, isLoading } = usePublishedPosts();
  const [active, setActive] = useState(ALL);

  const posts = data ?? [];

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) => p.category && map.set(p.category.slug, p.category.name));
    return [...map.entries()];
  }, [posts]);

  const visible = active === ALL ? posts : posts.filter((p) => p.category?.slug === active);

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Journal | Halliday Architects"
        description="Notes on residential architecture, coastal building and design detail from Halliday Architects in Ocean City, NJ."
        path="/blog"
      />
      <PageHero eyebrow="Writing" title="Journal" />

      <section className={sectionPadding.base}>
        <div className={container.wide}>
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-16">
              <button
                type="button"
                onClick={() => setActive(ALL)}
                className={`text-xs uppercase tracking-[0.14em] transition-colors ${active === ALL ? "text-ink" : "text-stone hover:text-ink"}`}
              >
                All
              </button>
              {categories.map(([slug, name]) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActive(slug)}
                  className={`text-xs uppercase tracking-[0.14em] transition-colors ${active === slug ? "text-ink" : "text-stone hover:text-ink"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap.grid}`}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/3] w-full bg-sand" style={{ borderRadius: "4px" }} />
                  <div className="mt-5 h-3 w-1/2 bg-sand" />
                  <div className="mt-3 h-2 w-1/3 bg-sand" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="border border-line px-8 py-20 text-center" style={{ borderRadius: "4px" }}>
              <p className="text-body max-w-md mx-auto">
                The first entries are being written.
              </p>
              <Link to="/contact" className="mt-6 inline-block label-uppercase text-ink hover:text-brand">
                Get in touch
              </Link>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap.grid}`}>
              {visible.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection variant="sand" />

      <GlobalFooter />
    </main>
  );
};

export default BlogPage;
