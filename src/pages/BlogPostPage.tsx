import { Link, useParams } from "react-router-dom";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PostBody from "@/components/blog/PostBody";
import PostCard from "@/components/blog/PostCard";
import { formatPostDate, usePublishedPost, usePublishedPosts } from "@/hooks/usePublicBlog";
import { container, gap, sectionPadding } from "@/lib/rhythm";

const BlogPostPage = () => {
  const { slug } = useParams();
  const { data: post, isLoading } = usePublishedPost(slug);
  const { data: all } = usePublishedPosts();

  const recent = (all ?? []).filter((p) => p.slug !== slug).slice(0, 3);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <GlobalNav lightHero />
        <div className="pt-40 pb-32 text-center text-stone">Loading…</div>
        <GlobalFooter />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background">
        <GlobalNav lightHero />
        <SEO title="Post not found | Halliday Architects" description="This journal entry could not be found." path={`/blog/${slug ?? ""}`} />
        <section className="pt-40 pb-32">
          <div className={`${container.narrow} text-center`}>
            <h1 className="heading-section text-ink mb-6">Post not found</h1>
            <Link to="/blog" className="label-uppercase text-ink hover:text-brand">
              Back to the journal
            </Link>
          </div>
        </section>
        <GlobalFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav lightHero={!post.cover_url} />
      <SEO
        title={`${post.title} | Halliday Architects`}
        description={post.excerpt ?? `${post.title} — from the Halliday Architects journal.`}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.cover_url ?? undefined}
      />

      {post.cover_url ? (
        <div className="w-full h-[60vh] min-h-[380px] bg-sand overflow-hidden">
          <img src={post.cover_url} alt="" className="w-full h-full object-cover" decoding="async" />
        </div>
      ) : (
        <div className="h-20" />
      )}

      <article className={sectionPadding.tight}>
        <div className={container.narrow}>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-stone mb-5">
            {post.category ? <span>{post.category.name}</span> : null}
            {post.category ? <span className="text-line">/</span> : null}
            <span>{formatPostDate(post.published_at ?? post.created_at)}</span>
          </div>
          <h1 className="heading-section text-ink mb-10">{post.title}</h1>
          {post.excerpt ? (
            <p className="font-serif font-light text-xl text-ink/80 mb-12">{post.excerpt}</p>
          ) : null}
          <PostBody html={post.body} className="post-body--editorial" />
        </div>
      </article>

      {recent.length > 0 && (
        <section className={`${sectionPadding.tight} border-t border-line`}>
          <div className={container.wide}>
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="heading-card text-ink">More from the journal</h2>
              <Link to="/blog" className="label-uppercase text-ink hover:text-brand">All entries</Link>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-3 ${gap.grid}`}>
              {recent.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <GlobalFooter />
    </main>
  );
};

export default BlogPostPage;
