import { Link } from "@/lib/router-compat";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

/**
 * Shared closing call to action — deliberately quiet so the architecture and
 * photography remain primary. This is the canonical treatment used site-wide.
 */
const CTASection = ({
  description = "Tell us about your site and what you have in mind.",
  buttonLabel = "Start a project",
  to = "/contact",
}: {
  description?: string;
  buttonLabel?: string;
  to?: string;
}) => (
  <section className="border-t border-line bg-sand px-6 py-20 text-center">
    <Reveal>
      <p className="text-[15px] text-stone">{description}</p>
      <Link to={to} className="link-inline group mt-5">
        {buttonLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </Reveal>
  </section>
);

export default CTASection;
