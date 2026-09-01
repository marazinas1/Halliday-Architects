import Reveal from "@/components/Reveal";
import { useTeamMembers, type TeamMember } from "@/hooks/useTeamMembers";

const isPrincipal = (m: TeamMember) => m.role.toLowerCase().includes("principal");

export const TeamCard = ({
  m,
  align = "center",
}: {
  m: TeamMember;
  align?: "center" | "left";
}) => (
  <div className={align === "center" ? "text-center" : "text-left"}>
    <div className="mb-5 aspect-[4/5] w-full overflow-hidden bg-sand">
      {m.photo_url ? (
        <img
          src={m.photo_url}
          alt={`${m.name}, ${m.role} at Halliday Architects`}
          width={880}
          height={1100}
          className="h-full w-full object-cover grayscale transition-[filter] duration-500 hover:grayscale-0 motion-reduce:transition-none"
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </div>
    <h3 className="heading-card text-ink text-lg mb-1">{m.name}</h3>
    {(m.role || m.credentials) && (
      <p className={`label-uppercase text-xs ${m.bio ? "mb-3" : ""}`}>
        {[m.role, m.credentials].filter(Boolean).join(" · ")}
      </p>
    )}
    {m.bio && (
      <>
        <div className={`w-8 h-px bg-ink/20 mb-3 ${align === "center" ? "mx-auto" : ""}`} />
        <p className="text-body text-sm leading-relaxed">{m.bio}</p>
      </>
    )}
  </div>
);

export const TeamGrid = () => {
  const { data, isLoading } = useTeamMembers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] w-full bg-sand" />
        ))}
      </div>
    );
  }

  if (!data?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
      {data.map((m) => (
        <Reveal key={m.id}>
          <TeamCard m={m} />
        </Reveal>
      ))}
    </div>
  );
};

export default TeamGrid;

const CenteredRoster = ({ members }: { members: TeamMember[] }) => {
  const rows: TeamMember[][] = [];
  for (let index = 0; index < members.length; index += 2) {
    rows.push(members.slice(index, index + 2));
  }

  return (
    <div className="space-y-12 lg:space-y-14">
      {rows.map((row) => (
        <div key={row.map((member) => member.id).join("-")} className="flex justify-center gap-8 lg:gap-10">
          {row.map((member) => (
            <Reveal key={member.id} className="w-full max-w-[22rem]">
              <TeamCard m={member} />
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  );
};

/** The complete public roster, grouped by role and centred at every count. */
export const TeamRoster = () => {
  const { data, isLoading } = useTeamMembers();
  const members = data ?? [];
  const principals = members.filter(isPrincipal);
  const studio = members.filter((m) => !isPrincipal(m));

  if (isLoading) {
    return (
      <div className="flex justify-center gap-8 lg:gap-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] w-full max-w-[22rem] bg-background/60" />
        ))}
      </div>
    );
  }

  if (!members.length) return null;

  return (
    <div className="space-y-0">
      {principals.length > 0 && (
        <CenteredRoster members={principals} />
      )}

      {studio.length > 0 && (
        <div className="mt-20 lg:mt-24">
          <Reveal>
            <div className="section-head">
              <span className="label-uppercase">The studio</span>
              <h3 className="heading-section text-ink">Working alongside them</h3>
            </div>
          </Reveal>
          <CenteredRoster members={studio} />
        </div>
      )}
    </div>
  );
};

/**
 * Only the principals — used on the About page so it does not duplicate /team.
 * `centered` (default true) restores the mx-auto centring the About page relied
 * on; the homepage studio section passes `centered={false}` to align left and
 * `portrait` for the 4:5 grayscale treatment.
 */
export const PrincipalsGrid = ({
  centered = true,
}: {
  centered?: boolean;
  portrait?: boolean;
}) => {
  const { data, isLoading } = useTeamMembers();
  const principals = (data ?? []).filter((m) => m.role.toLowerCase().includes("principal"));
  const align = centered ? "mx-auto" : "";


  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-20 ${align}`}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] w-full bg-sand"
          />
        ))}
      </div>
    );
  }

  if (!principals.length) return null;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-20 ${align}`}>
      {principals.map((m) => (
        <Reveal key={m.id}>
          <TeamCard m={m} align={centered ? "center" : "left"} />
        </Reveal>
      ))}
    </div>
  );
};
