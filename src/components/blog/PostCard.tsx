import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { formatPostDate, type PublicPost } from "@/hooks/usePublicBlog";

const PostCard = ({ post }: { post: PublicPost }) => (
  <Reveal>
    <Link to={`/blog/${post.slug}`} className="group block">
      <div
        className="aspect-[4/3] w-full overflow-hidden bg-sand"
        style={{ borderRadius: "4px" }}
      >
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-90"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-stone">
        {post.category ? <span>{post.category.name}</span> : null}
        {post.category && post.published_at ? <span className="text-line">/</span> : null}
        <span>{formatPostDate(post.published_at ?? post.created_at)}</span>
      </div>
      <h3 className="heading-card text-ink text-lg mt-2 group-hover:text-brand transition-colors">
        {post.title}
      </h3>
      {post.excerpt ? (
        <p className="text-small mt-2 line-clamp-3">{post.excerpt}</p>
      ) : null}
    </Link>
  </Reveal>
);

export default PostCard;
