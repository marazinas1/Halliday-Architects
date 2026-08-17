import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/sections/ContactSection";

const ContactPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Contact | Halliday Leonard General Contractors"
      description="Request a consultation with Halliday Leonard — custom home builders in Ocean City, New Jersey. 609.398.5737."
      path="/contact"
    />
    <PageHero eyebrow="Get In Touch" title="Request a Consultation" />

    <ContactSection withHeading={false} />

    <GlobalFooter />
  </main>
);

export default ContactPage;
