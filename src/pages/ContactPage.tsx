import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/sections/ContactSection";

const ContactPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Contact | Halliday Architects"
      description="Get in touch with Halliday Architects — architecture practice in Ocean City, New Jersey. 609.957.6789."
      path="/contact"
    />
    <PageHero eyebrow="Get In Touch" title="Request a Consultation" />

    <ContactSection withHeading={false} />

    <GlobalFooter />
  </main>
);

export default ContactPage;
