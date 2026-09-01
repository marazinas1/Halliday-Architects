import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import ContactSection from "@/components/sections/ContactSection";
import ContactMap from "@/components/ContactMap";
import { usePublicProjects } from "@/hooks/usePublicProjects";
import { container } from "@/lib/rhythm";

const ContactPage = () => {
  const { data: projects = [], isLoading } = usePublicProjects();
  const cover = projects.find((project) => project.card_image_url);

  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Contact | Halliday Architects"
        description="Get in touch with Halliday Architects — architecture practice in Ocean City, New Jersey. 609.957.6789."
        path="/contact"
        image={cover?.card_image_url ?? undefined}
      />

      <header className="px-6 pb-16 pt-20 text-center md:pb-20 md:pt-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">
          Get in touch
        </p>
        <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">Contact</h1>
        <p className="mx-auto mt-5 max-w-[48ch] text-[15px] leading-relaxed text-stone">
          Tell us about your site and what you have in mind. Every enquiry is
          read and answered personally by one of the principals.
        </p>
      </header>

      {(isLoading || cover?.card_image_url) && (
        <section className={`${container.wide} pb-16 md:pb-24`} aria-label="Halliday Architects project photography">
          <div className="h-[34vh] min-h-[260px] overflow-hidden bg-sand md:h-[48vh] md:min-h-[380px]">
            {cover?.card_image_url ? (
              <img
                src={cover.card_image_url}
                alt={cover.card_image_alt}
                width={2000}
                height={900}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-sand" aria-hidden="true" />
            )}
          </div>
        </section>
      )}

      <ContactSection withHeading={false} />

      <ContactMap />

      <GlobalFooter />
    </main>
  );
};

export default ContactPage;
