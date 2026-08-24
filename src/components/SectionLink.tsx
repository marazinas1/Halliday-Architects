import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * The centred underlined link that sits below a section's grid or prose.
 * Accepts either a `label` string or `children` for the link text, so both the
 * homepage sections and the About page can use one component.
 */
const SectionLink = ({
  to,
  label,
  children,
}: {
  to: string;
  label?: string;
  children?: React.ReactNode;
}) => (
  <div className="below-link">
    <Link to={to} className="link-inline">
      {label ?? children}
      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  </div>
);

export default SectionLink;
