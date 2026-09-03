import { useMemo } from "react";
import { Link, useLocation, useParams } from "@/lib/router-compat";
import { ArrowLeft, ArrowRight } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import ResponsiveImage from "@/components/ResponsiveImage";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PostBody from "@/components/blog/PostBody";
import PostCard from "@/components/blog/PostCard";
import PreviewBanner from "@/components/admin/PreviewBanner";
import { previewPath, readPreview } from "@/lib/admin/preview";
import {
  formatPostDate,
  usePublishedPost,
  usePublishedPosts,
  type PublicPost,
} from "@/hooks/usePublicBlog";
import { container, gap, sectionPadding } from "@/lib/rhythm";

const BlogPostPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const isPreview = location.pathname === previewPath("blog");
  const previewPost = useMemo(
    () => (isPreview ? readPreview<PublicPost>("blog") : null),
    [isPreview],
  );
  const query = usePublishedPost(isPreview ? undefined : slug);
  const post = isPreview ? previewPost : query.data;
  const isLoading = isPreview ? false : query.isLoading;
  const { data: all } = usePublishedPosts();

  const recent = (all ?? []).filter((p) => p.slug !== post?.slug).slice(0, 3);

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
            <h1 className="heading-section text-ink mb-6">
              {isPreview ? "No preview data" : "Post not found"}
            </h1>
            {isPreview && (
              <p className="text-stone mb-6">Open this from the post editor's Preview button.</p>
            )}
            <Link to="/blog" className="link-inline group">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to the journal
            </Link>
          </div>
        </section>
        <GlobalFooter />
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-background${isPreview ? " pt-9" : ""}`}>
      {isPreview && <PreviewBanner label="journal entry" />}
      <GlobalNav lightHero={!post.cover_url} />
      {!isPreview && (
      <SEO
        title={`${post.title} | Halliday Architects`}
        description={post.excerpt ?? `${post.title} — from the Halliday Architects journal.`}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.cover_url ?? undefined}
      />
      )}

      {post.cover_url ? (
        <div className="w-full h-[60vh] min-h-[380px] bg-sand overflow-hidden">
          <ResponsiveImage
            src={post.cover_url}
            alt={post.title}
            width={2000}
            height={1200}
            sizes="100vw"
            maxWidth={2400}
            quality={85}
            priority
            className="w-full h-full object-cover"
          />
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
              <Link to="/blog" className="link-inline group">
                All entries
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
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
