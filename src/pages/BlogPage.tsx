import { useMemo, useState } from "react";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import CTASection from "@/components/CTASection";
import SEO from "@/components/SEO";
import PostCard from "@/components/blog/PostCard";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
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
      <Reveal>
        <header className="px-6 pb-12 pt-20 text-center md:pb-14 md:pt-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">Ideas &amp; observations</p>
          <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">Journal</h1>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-stone">
            Notes on residential architecture, coastal living and the details that shape a home.
          </p>
        </header>
      </Reveal>


      <section className={posts.length === 0 && !isLoading ? "pb-20 md:pb-28" : sectionPadding.tight}>
        <div className={container.wide}>
          {categories.length > 0 && (
            <div className="mb-14 flex flex-wrap justify-center gap-x-8 gap-y-3 border-y border-line py-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActive(ALL)}
                className={`h-auto rounded-none px-0 py-0 text-[11px] uppercase tracking-[0.16em] hover:bg-transparent ${active === ALL ? "text-ink underline underline-offset-8" : "text-stone hover:text-ink"}`}
              >
                All
              </Button>
              {categories.map(([slug, name]) => (
                <Button
                  key={slug}
                  type="button"
                  variant="ghost"
                  onClick={() => setActive(slug)}
                  className={`h-auto rounded-none px-0 py-0 text-[11px] uppercase tracking-[0.16em] hover:bg-transparent ${active === slug ? "text-ink underline underline-offset-8" : "text-stone hover:text-ink"}`}
                >
                  {name}
                </Button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap.grid}`}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] w-full animate-pulse rounded bg-sand" />
                  <div className="mt-5 h-3 w-1/2 bg-sand" />
                  <div className="mt-3 h-2 w-1/3 bg-sand" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="border-y border-line px-6 py-20 text-center md:py-24">
              <p className="text-2xl font-light text-ink">The first entries are on their way.</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone">
                The journal is being prepared. Please check back for notes from the studio.
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gap.grid}`}>
              {visible.map((post, i) => (
                <PostCard key={post.id} post={post} delay={(i % 3) * 150} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />

      <GlobalFooter />
    </main>
  );
};

export default BlogPage;
