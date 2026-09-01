import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";
import PreviewBanner from "@/components/admin/PreviewBanner";
import { TeamCard } from "@/components/sections/TeamSection";
import { readPreview } from "@/lib/admin/preview";
import type { TeamMember } from "@/hooks/useTeamMembers";
import { container, sectionPadding } from "@/lib/rhythm";

/** Renders an unsaved team member in the same Studio context used on /about. */
const TeamMemberPreview = () => {
  const member = readPreview<TeamMember>("team");

  return (
    <main className="min-h-screen bg-background pt-9">
      <PreviewBanner label="team member" />
      <GlobalNav />
      <header className="px-6 pb-12 pt-20 text-center md:pb-14 md:pt-24">
        <p className="label-uppercase">The studio</p>
        <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">Led by the principals</h1>
      </header>
      <section className={`${sectionPadding.base} section-sand`}>
        <div className={container.people}>
          {member ? (
            <div className="mx-auto max-w-[22rem]">
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
