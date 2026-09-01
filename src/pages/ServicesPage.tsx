import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { SERVICE_GROUPS } from "@/content/firm";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { container } from "@/lib/rhythm";

const ServicesPage = () => {
  const { data: projects = [], isLoading } = usePublicProjects();

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Services | Halliday Architects"
        description="Architectural consultation, design, code analysis, and permit coordination from Halliday Architects in Ocean City, NJ."
        path="/services"
      />

      <header className="px-6 pb-16 pt-20 text-center md:pb-20 md:pt-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">
          What we do
        </p>
        <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">Services</h1>
        <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-relaxed text-stone">
          A residential practice in Ocean City, New Jersey. We take a house
          from the first conversation about a site through to the questions that
          come up during construction.
        </p>
      </header>

      <div className="flex flex-col gap-[2px]">
        {SERVICE_GROUPS.map((group, index) => {
          const project = projects[index];
          const hasMedia = isLoading || Boolean(project?.card_image_url);
          const imageFirstOnDesktop = index % 2 === 0;

          return (
            <Reveal key={group.title}>
              <section
                className={`grid min-[900px]:h-[32rem] ${
                  hasMedia ? "min-[900px]:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {hasMedia && (
                  <div
                    className={`h-80 overflow-hidden bg-sand min-[900px]:h-full ${
                      imageFirstOnDesktop ? "min-[900px]:order-1" : "min-[900px]:order-2"
                    }`}
                  >
                    {project?.card_image_url ? (
                      <img
                        src={project.card_image_url}
                        alt={project.card_image_alt}
                        width={1600}
                        height={1200}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full animate-pulse bg-sand" aria-hidden="true" />
                    )}
                  </div>
                )}

                <div
                  className={`flex items-center py-14 min-[900px]:h-full min-[900px]:py-0 ${
                    index % 2 === 0 ? "section-sand" : "bg-background"
                  } ${
                    hasMedia && imageFirstOnDesktop ? "min-[900px]:order-2" : "min-[900px]:order-1"
                  }`}
                >
                  <div className={`${container.narrow} w-full`}>
                    <h2 className="text-2xl font-semibold leading-tight text-ink md:text-3xl">
                      {group.title}
                    </h2>
                    <p className="mt-5 text-[15px] leading-[1.85] text-stone">
                      {group.body}
                    </p>
                    <div className="mt-8 h-px w-8 bg-line" />
                    <p className="mt-5 text-[11px] uppercase leading-7 tracking-[0.14em] text-stone">
                      {group.includes.join(" · ")}
                    </p>
                  </div>
                </div>
              </section>
            </Reveal>
          );
        })}
      </div>

      <CTASection
        variant="sand"
        eyebrow="Next step"
        heading="Start a project with us"
        description="Tell us about your site and what you have in mind, and we will reply personally."
      />

      <GlobalFooter />
    </main>
  );
};

export default ServicesPage;
