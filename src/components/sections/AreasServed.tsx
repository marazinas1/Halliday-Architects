import Reveal from "@/components/Reveal";
import { container, sectionPadding } from "@/lib/rhythm";

/** Memberships and licensure, from the principals' own listings. */
const AFFILIATIONS = ["AIA New Jersey", "NCARB", "LEED AP", "Best of Houzz ×9"];

/**
 * Shore communities the practice works in.
 * Source: the practice's Houzz profile ("Areas served"). Verifiable, not invented —
 * update here if the profile changes.
 */
const AREAS = [
  "Atlantic City",
  "Ocean City",
  "Somers Point",
  "Brigantine",
  "Linwood",
  "Margate City",
  "Marmora",
  "Sea Isle City",
  "Longport",
  "Strathmere",
];

/** Quiet centered band — affiliations above, the towns in one line below. */
const AreasServed = () => (
  <section className={`${sectionPadding.base} section-sand`}>
    <div className={container.content}>
      <Reveal>
        <div className="text-center">
          <p className="label-uppercase">Registered and accredited</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {AFFILIATIONS.map((a) => (
              <span
                key={a}
                className="text-sm font-semibold uppercase tracking-[0.1em] text-stone"
              >
                {a}
              </span>
            ))}
          </div>
          <p className="text-body mt-16 max-w-2xl mx-auto">
            The studio works throughout the New Jersey shore, from Ocean City north to
            Atlantic City and south along the barrier islands.
          </p>
          <p className="mt-4 text-sm font-medium text-ink">{AREAS.join(" · ")}</p>
        </div>
      </Reveal>
    </div>
  </section>
);

export default AreasServed;
