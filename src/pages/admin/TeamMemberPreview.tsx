import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import PageHero from "@/components/PageHero";
import PreviewBanner from "@/components/admin/PreviewBanner";
import { TeamCard } from "@/components/sections/TeamSection";
import { readPreview } from "@/lib/admin/preview";
import type { TeamMember } from "@/hooks/useTeamMembers";
import { container, sectionPadding } from "@/lib/rhythm";

/** Renders an unsaved team member exactly as the /team grid would. */
const TeamMemberPreview = () => {
  const member = readPreview<TeamMember>("team");

  return (
    <main className="min-h-screen bg-background pt-9">
      <PreviewBanner label="team member" />
      <GlobalNav />
      <PageHero eyebrow="Our Team" title="The Studio" />
      <section className={sectionPadding.base}>
        <div className={container.wide}>
          {member ? (
            <div className="mx-auto max-w-xs">
              <TeamCard m={member} />
            </div>
          ) : (
            <p className="text-center text-stone">
              No preview data. Open this from the team form's Preview button.
            </p>
          )}
        </div>
      </section>
      <GlobalFooter />
    </main>
  );
};

export default TeamMemberPreview;
