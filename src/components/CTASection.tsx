import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Shared closing call to action — mirrors the StageHomy HomeCTA pattern:
 * eyebrow, extrabold headline, one line of copy, one solid ink button.
 */
const CTASection = ({
  eyebrow = "Start a project",
  heading = "Let's talk about your house",
  description = "Tell us about your site and what you have in mind. Every enquiry is answered personally by a principal.",
  buttonLabel = "Start a project",
  to = "/contact",
  variant = "light",
}: {
  eyebrow?: string;
  heading?: string;
  description?: string;
  buttonLabel?: string;
  to?: string;
  variant?: "light" | "sand" | "ink";
}) => {
  const isInk = variant === "ink";

  return (
    <section
      className={`${sectionPadding.base} ${
        isInk ? "bg-ink" : variant === "sand" ? "section-sand" : "bg-background"
      }`}
    >
      <div className={container.wide}>
        <Reveal>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <p className={`label-uppercase mb-6 ${isInk ? "text-paper/50" : ""}`}>{eyebrow}</p>
            <h2 className={`heading-section ${isInk ? "text-paper" : "text-ink"}`}>{heading}</h2>
            <p className={`text-body mt-6 max-w-xl ${isInk ? "text-paper/70" : ""}`}>{description}</p>
            <Link
              to={to}
              className={`group mt-10 inline-flex items-center justify-center gap-3 h-12 px-8 text-sm font-medium uppercase tracking-[0.1em] transition-all duration-300 ${
                isInk ? "bg-paper text-ink hover:opacity-90" : "bg-ink text-paper hover:opacity-90"
              }`}
            >
              {buttonLabel}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CTASection;
