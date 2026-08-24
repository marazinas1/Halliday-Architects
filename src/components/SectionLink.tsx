import { Link } from "react-router-dom";

/**
 * The centred underlined link that sits below a section's grid or prose.
 * Wraps the shared `.below-link` / `.link-inline` pattern so it is not
 * re-implemented in every section.
 */
const SectionLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <div className="below-link">
    <Link to={to} className="link-inline">
      {children}
    </Link>
  </div>
);

export default SectionLink;
