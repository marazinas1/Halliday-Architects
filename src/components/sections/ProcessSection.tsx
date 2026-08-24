import Reveal from "@/components/Reveal";
import { HOW_WE_WORK } from "@/content/firm";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * The sequence a project moves through, in the client's language.
 * Copy lives in src/content/firm.ts (HOW_WE_WORK); this is presentation only.
 *
 * `eyebrow` and `heading` default to the homepage wording and are overridable
 * so the About page can reuse this section without duplicating it.
 */
const ProcessSection = ({
  eyebrow = "The process",
  heading = "From first visit to final walkthrough",
}: {
  eyebrow?: string;
  heading?: string;
}) => (
  <section className={`${sectionPadding.base} bg-background`}>
    <div className={container.wide}>
      <Reveal>
        <div className="section-head">
          <span className="label-uppercase">{eyebrow}</span>
          <h2 className="heading-section text-ink">{heading}</h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {HOW_WE_WORK.map((step, i) => (
          <Reveal key={step.title}>
            <div className="border-t border-ink pt-6 text-center">
              <span className="text-[11px] font-semibold tracking-[0.16em] text-stone">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="heading-card text-ink mt-3">{step.title}</h3>
              <p className="text-body mt-3 mx-auto max-w-[32ch]">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
