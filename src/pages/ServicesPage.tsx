import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { SERVICE_GROUPS } from "@/content/firm";
import { sectionPadding } from "@/lib/rhythm";

const ServicesPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Services | Halliday Architects"
      description="Architectural consultation, design, code analysis, and permit coordination from Halliday Architects in Ocean City, NJ."
      path="/services"
    />
    <PageHero eyebrow="What We Do" title="Services" />

    <section className={`${sectionPadding.base} bg-background`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-body max-w-2xl mx-auto mb-16 text-center">
            A residential practice in Ocean City, New Jersey. We take a house
            from the first conversation about a site through to the questions that
            come up during construction.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
          {SERVICE_GROUPS.map((group) => (
            <Reveal key={group.title}>
              <div className="flex flex-col items-center text-center">
                <span className="w-12 h-12 rounded-full border border-line grid place-items-center text-ink">
                  <group.icon size={21} strokeWidth={1.5} />
                </span>
                <h3 className="heading-card text-ink text-lg mt-4">
                  {group.title}
                </h3>
                <p className="text-body text-sm mt-4 max-w-[46ch] mx-auto">
                  {group.body}
                </p>
                <div className="w-8 h-px bg-line mx-auto mt-6" />
                <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-stone">
                  {group.includes.join(" · ")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    <CTASection
      variant="sand"
      eyebrow="Next step"
      heading="Start a project with us"
      description="Tell us about your site and what you have in mind, and we will reply personally."
    />

    <GlobalFooter />
  </main>
);

export default ServicesPage;
