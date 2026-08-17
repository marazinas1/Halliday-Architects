import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/sections/ContactSection";
import ContactMap from "@/components/ContactMap";

const ContactPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Contact | Halliday Architects"
      description="Get in touch with Halliday Architects — architecture practice in Ocean City, New Jersey. 609.957.6789."
      path="/contact"
    />
    <PageHero eyebrow="Get In Touch" title="Contact" />

    <ContactSection withHeading={false} />

    {/* Full-width map band below the contact details. */}
    <ContactMap />

    <GlobalFooter />
  </main>
);

export default ContactPage;
