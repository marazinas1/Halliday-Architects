import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { container, sectionPadding } from "@/lib/rhythm";

/** Short studio note leading to the team page. PLACEHOLDER COPY. */
const StudioPreview = () => (
  <section className={sectionPadding.base}>
    <div className={container.wide}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
        <p className="label-uppercase lg:col-span-3 lg:pt-4">The studio</p>
        <div className="lg:col-span-9">
          <Reveal>
            <p className="statement text-ink max-w-3xl">
              A small studio in Ocean City, led personally by both principals — Christopher and
              Shannon Halliday, RA, LEED AP.
            </p>
            <Link to="/team" className="mt-10 inline-block label-uppercase text-ink link-underline">
              Meet the studio
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default StudioPreview;
