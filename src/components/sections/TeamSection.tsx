import Reveal from "@/components/Reveal";
import { useTeamMembers, type TeamMember } from "@/hooks/useTeamMembers";

const isPrincipal = (m: TeamMember) => m.role.toLowerCase().includes("principal");

export const TeamCard = ({
  m,
  align = "center",
  portrait = false,
}: {
  m: TeamMember;
  align?: "center" | "left";
  /** 4:5 grayscale portrait treatment, used by the homepage studio section. */
  portrait?: boolean;
}) => (
  <div className={align === "center" ? "text-center" : "text-left"}>
    <div
      className={`${portrait ? "aspect-[4/5]" : "aspect-square"} w-full mb-5 overflow-hidden bg-sand`}
      style={{ borderRadius: "4px" }}
    >
      {m.photo_url ? (
        <img
          src={m.photo_url}
          alt={`${m.name}, ${m.role} at Halliday Architects`}
          className={`w-full h-full object-cover ${portrait ? "grayscale" : ""}`}
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

/**
 * The full roster, split into two groups so the practice's structure is visible:
 * principals first (tall 4:5 grayscale portraits, side by side), then everyone
 * else under a quiet "The studio" label (square cards, three across). Used on
 * /team. TeamGrid and PrincipalsGrid are left intact for their other callers.
 */
export const TeamRoster = () => {
  const { data, isLoading } = useTeamMembers();
  const members = data ?? [];
  const principals = members.filter(isPrincipal);
  const studio = members.filter((m) => !isPrincipal(m));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-14 max-w-4xl mx-auto">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] w-full bg-sand" style={{ borderRadius: "4px" }} />
        ))}
      </div>
    );
  }

  if (!members.length) return null;

  return (
    <div className="space-y-0">
      {principals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-14 max-w-4xl mx-auto">
          {principals.map((m) => (
            <Reveal key={m.id}>
              <TeamCard m={m} align="center" portrait />
            </Reveal>
          ))}
        </div>
      )}

      {studio.length > 0 && (
        <div className="mt-20 lg:mt-24">
          <Reveal>
            <div className="text-center mb-16">
              <span className="label-uppercase">The studio</span>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-4xl mx-auto">
            {studio.map((m) => (
              <Reveal key={m.id}>
                <TeamCard m={m} align="center" />
              </Reveal>
            ))}
          </div>
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
  portrait = false,
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
            className={`${portrait ? "aspect-[4/5]" : "aspect-square"} w-full bg-sand`}
            style={{ borderRadius: "4px" }}
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
          <TeamCard m={m} align={centered ? "center" : "left"} portrait={portrait} />
        </Reveal>
      ))}
    </div>
  );
};
