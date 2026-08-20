import Reveal from "@/components/Reveal";
import { useTeamMembers, type TeamMember } from "@/hooks/useTeamMembers";

export const TeamCard = ({ m }: { m: TeamMember }) => (
  <div className="text-center">
    <div
      className="aspect-square w-full mb-5 overflow-hidden bg-sand"
      style={{ borderRadius: "4px" }}
    >
      {m.photo_url ? (
        <img
          src={m.photo_url}
          alt={`${m.name}, ${m.role} at Halliday Architects`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent"
          aria-label={`Portrait placeholder for ${m.name}`}
        >
          <span className="text-5xl font-light text-ink/30">
            {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
        </div>
      )}
    </div>
    <h3 className="heading-card text-ink text-lg mb-1">{m.name}</h3>
    <p className="label-uppercase text-xs mb-3">
      {m.credentials ? `${m.role} · ${m.credentials}` : m.role}
    </p>
    {m.bio && (
      <>
        <div className="w-8 h-px bg-ink/20 mx-auto mb-3" />
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
          <div key={i} className="aspect-square w-full bg-sand" style={{ borderRadius: "4px" }} />
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

/** Only the principals — used on the About page so it does not duplicate /team. */
export const PrincipalsGrid = () => {
  const { data, isLoading } = useTeamMembers();
  const principals = (data ?? []).filter((m) => m.role.toLowerCase().includes("principal"));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 max-w-2xl">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="aspect-square w-full bg-sand" style={{ borderRadius: "4px" }} />
        ))}
      </div>
    );
  }

  if (!principals.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 max-w-2xl">
      {principals.map((m) => (
        <Reveal key={m.id}>
          <TeamCard m={m} />
        </Reveal>
      ))}
    </div>
  );
};
