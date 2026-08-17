import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { TeamGrid } from "@/components/sections/TeamSection";

const TeamPage = () => (
  <main className="min-h-screen bg-background">
    <GlobalNav />
    <SEO
      title="Our Team | Halliday Leonard General Contractors"
      description="Meet the four partners behind Halliday Leonard — every project is led personally by an owner of the firm."
      path="/team"
    />
    <PageHero eyebrow="Our Team" title="The Partners" />

    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <Reveal>
          <p className="text-body max-w-2xl mx-auto text-center mb-16">
            Four partners. One standard. Every project is led personally by an owner of the firm —
            from the first sketch to the final walkthrough.
          </p>
        </Reveal>
        <TeamGrid />
      </div>
    </section>

    <GlobalFooter />
  </main>
);

export default TeamPage;
