import DOMPurify from "dompurify";

/**
 * Renders stored post HTML. The body is admin-authored, but it is still
 * sanitised on render and restricted to the tags the editor can produce.
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "s", "code", "pre",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "hr",
  "a", "img",
];
const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title"];

export function sanitizePostHtml(html: string): string {
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
  });
}

const PostBody = ({ html, className = "" }: { html: string; className?: string }) => (
  <div
    className={`post-body ${className}`}
    dangerouslySetInnerHTML={{ __html: sanitizePostHtml(html) }}
  />
);

export default PostBody;
