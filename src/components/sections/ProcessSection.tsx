import Reveal from "@/components/Reveal";
import { HOW_WE_WORK } from "@/content/firm";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * The sequence a project moves through, in the client's language.
 * Copy lives in src/content/firm.ts (HOW_WE_WORK); this is presentation only.
 */
const ProcessSection = () => (
  <section className={`${sectionPadding.base} bg-background`}>
    <div className={container.wide}>
      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 mb-14 lg:mb-20">
          <p className="label-uppercase lg:col-span-3 lg:pt-3">The process</p>
          <h2 className="heading-section text-ink lg:col-span-9 max-w-2xl">
            From first visit to final walkthrough
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-10">
        {HOW_WE_WORK.map((step, i) => (
          <Reveal key={step.title}>
            <div className="border-t border-ink pt-6">
              <span className="text-xs font-semibold tracking-[0.16em] text-stone">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="heading-card text-ink text-lg mt-3">{step.title}</h3>
              <p className="text-body text-sm mt-3 leading-relaxed">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
