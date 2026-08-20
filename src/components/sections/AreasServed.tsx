import Reveal from "@/components/Reveal";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * Shore communities the practice works in.
 * Source: the practice's Houzz profile ("Areas served"). Verifiable, not invented —
 * update here if the profile changes.
 */
const AREAS = [
  "Ocean City",
  "Sea Isle City",
  "Longport",
  "Margate City",
  "Somers Point",
  "Brigantine",
  "Linwood",
  "Marmora",
  "Strathmere",
  "Atlantic City",
];

/** Quiet, typographic list — deliberately not a map and not cards. */
const AreasServed = () => (
  <section className={`${sectionPadding.base} section-sand`}>
    <div className={container.wide}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
        <p className="label-uppercase lg:col-span-3 lg:pt-3">Areas served</p>
        <div className="lg:col-span-9">
          <Reveal>
            <p className="text-body max-w-xl">
              The studio works throughout the New Jersey shore, from Ocean City north to
              Atlantic City and south along the barrier islands.
            </p>
            <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
              {AREAS.map((area) => (
                <li
                  key={area}
                  className="border-t border-line pt-3 text-sm font-medium text-ink"
                >
                  {area}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default AreasServed;