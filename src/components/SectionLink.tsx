import { Link } from "@/lib/router-compat";
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
    <Link to={to} className="link-inline group">
      {label ?? children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  </div>
);

export default SectionLink;
