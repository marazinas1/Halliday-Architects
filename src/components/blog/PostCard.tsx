import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/ResponsiveImage";
import Reveal from "@/components/Reveal";
import { formatPostDate, type PublicPost } from "@/hooks/usePublicBlog";

const PostCard = ({ post, delay = 0 }: { post: PublicPost; delay?: number }) => (
  <Reveal delay={delay}>
    <Link to={`/blog/${post.slug}`} className="group block">
      <div className="aspect-[4/5] w-full overflow-hidden rounded bg-sand">
        {post.cover_url ? (
          <ResponsiveImage
            src={post.cover_url}
            alt={post.title}
            width={1200}
            height={1500}
            sizes="(min-width: 768px) 34vw, 100vw"
            quality={82}
            maxWidth={1600}
            className="h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-stone">
        {post.category ? <span>{post.category.name}</span> : null}
        {post.category && post.published_at ? <span className="text-line">/</span> : null}
        <span>{formatPostDate(post.published_at ?? post.created_at)}</span>
      </div>
      <h3 className="mt-2 text-xl font-semibold leading-tight text-ink transition-opacity duration-300 group-hover:opacity-70">
        {post.title}
      </h3>
      {post.excerpt ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone">{post.excerpt}</p>
      ) : null}
    </Link>
  </Reveal>
);

export default PostCard;
