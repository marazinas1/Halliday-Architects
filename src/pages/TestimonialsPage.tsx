import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

const TestimonialsPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Testimonials | Halliday Leonard General Contractors"
      description="What Halliday Leonard clients say about building their custom home in Ocean City, New Jersey."
      path="/testimonials"
    />
    <PageHero eyebrow="Client Voices" title="Testimonials" />

    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <Reveal>
          <TestimonialsCarousel />
        </Reveal>
      </div>
    </section>

    <GlobalFooter />
  </main>
);

export default TestimonialsPage;
