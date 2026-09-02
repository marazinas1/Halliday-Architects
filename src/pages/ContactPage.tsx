import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import ContactSection from "@/components/sections/ContactSection";
import ContactMapSection from "@/components/ContactMapSection";
import Reveal from "@/components/Reveal";
import ResponsiveImage from "@/components/ResponsiveImage";
import { usePageContent } from "@/hooks/usePageContent";
import { useResolvedPageImages } from "@/hooks/useResolvedPageImages";
import { pageHeader } from "@/lib/rhythm";

const ContactPage = () => {
  const page = usePageContent();
  // Shared resolver: chosen photograph → developer default → project photography.
  // Decide before painting: while content is still loading the band keeps its
  // space; once loaded, it either has a photograph or is never rendered.
  const { resolve, isLoading } = useResolvedPageImages();
  const photo = resolve("contact", "hero");
  const cover = photo.url ? { url: photo.url, alt: photo.alt } : null;


  return (
    <main className="min-h-screen bg-background">
      <GlobalNav />
      <SEO
        title="Contact | Halliday Architects"
        description="Get in touch with Halliday Architects — architecture practice in Ocean City, New Jersey. 609.957.6789."
        path="/contact"
        image={cover?.url ?? undefined}
      />

      <Reveal>
        <header className={pageHeader}>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">
            Get in touch
          </p>
          <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">
            {page.copy("contact", "heading", "Contact")}
          </h1>
          <p className="mx-auto mt-5 max-w-[48ch] text-[15px] leading-relaxed text-stone">
            {page.copy(
              "contact",
              "intro",
              "Tell us about your site and what you have in mind. Every enquiry is read and answered personally by one of the principals.",
            )}
          </p>
        </header>
      </Reveal>

      {(isLoading || cover) && (
        <Reveal>
          <section className="w-full pb-16 md:pb-24" aria-label="Halliday Architects project photography">
            <div className="h-[34vh] min-h-[260px] overflow-hidden bg-sand md:h-[48vh] md:min-h-[380px]">
              {cover ? (
                <ResponsiveImage
                  src={cover.url}
                  alt={cover.alt}
                  width={2000}
                  height={900}
                  sizes="100vw"
                  maxWidth={2400}
                  quality={85}
                  priority
                  className="h-full w-full object-cover"
                />

              ) : (
                <div className="h-full w-full animate-pulse bg-sand" aria-hidden="true" />
              )}
            </div>
          </section>
        </Reveal>
      )}


      <ContactSection withHeading={false} />

      <ContactMapSection />

      <GlobalFooter />
    </main>
  );
};

export default ContactPage;
