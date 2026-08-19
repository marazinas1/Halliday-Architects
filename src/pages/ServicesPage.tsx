import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import ServicesSection from "@/components/sections/ServicesSection";

const ServicesPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Services | Halliday Architects"
      description="Architectural consultation, design, code analysis, and permit coordination from Halliday Architects in Ocean City, NJ."
      path="/services"
    />
    <PageHero eyebrow="What We Do" title="Services" />

    <ServicesSection withHeading={false} />

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
