import Reveal from "@/components/Reveal";
import SectionLink from "@/components/SectionLink";
import { usePageContent } from "@/hooks/usePageContent";
import { container, sectionPadding } from "@/lib/rhythm";

/**
 * The practice prose. Every paragraph is editable in the admin panel; the
 * wording written here is what the page shows until the client changes it.
 */
export const ABOUT_PROSE_FALLBACKS = {
  intro_1:
    "Halliday Architects is a residential architecture practice in Ocean City, New Jersey, led by Christopher and Shannon Halliday. Both are registered architects and LEED accredited professionals, and the studio has worked along the shore since 2013.",
  intro_2:
    "The work draws on the local vernacular, on current building technology, and on the functional relationships between the spaces of a house. New homes, additions, renovations and interiors — each one designed for its site and for the family who will live in it.",
  intro_3:
    "The studio is deliberately small. Every project is led personally by a principal, from the first site visit through construction administration, so the person who drew the house is the person answering questions on site.",
};

const AboutSection = () => {
  const page = usePageContent();
  const paragraphs = (["intro_1", "intro_2", "intro_3"] as const).map((slot) =>
    page.copy("about", slot, ABOUT_PROSE_FALLBACKS[slot]),
  );

  return (
    <section className={`${sectionPadding.tight} pb-20 md:pb-24`}>
      <div className={container.content}>
        <Reveal>
          <div className="text-center">
            {paragraphs.map((text, index) => (
              <p key={index} className={index === paragraphs.length - 1 ? "text-body mb-10" : "text-body mb-6"}>
                {text}
              </p>
            ))}
            <SectionLink to="/services" label="What we do" />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutSection;
