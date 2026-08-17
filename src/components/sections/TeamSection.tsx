import Reveal from "@/components/Reveal";

export const team = [
  { name: "Scott Halliday", role: "Founding Partner", bio: "Forty years of building the finest custom homes in Ocean City." },
  { name: "Keith Leonard", role: "Founding Partner", bio: "A steady hand on every project — on time, on budget, on point." },
  { name: "Scott Halliday Jr.", role: "Partner", bio: "Carrying the Halliday craftsmanship into the next generation of coastal builds." },
  { name: "Matt Leonard", role: "Partner", bio: "Leading the development side with an eye for detail and execution." },
];

export const TeamCard = ({ m }: { m: (typeof team)[0] }) => (
  <div className="text-center">
    <div
      className="aspect-square w-full mb-5 flex items-center justify-center bg-gradient-to-br from-muted to-accent"
      style={{ borderRadius: "4px" }}
      aria-label={`Portrait placeholder for ${m.name}`}
    >
      <span className="font-serif text-5xl text-charcoal/30">
        {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
      </span>
    </div>
    <h3 className="heading-card text-charcoal text-lg mb-1">{m.name}</h3>
    <p className="label-uppercase text-xs mb-3">{m.role}</p>
    <div className="w-8 h-px bg-charcoal/20 mx-auto mb-3" />
    <p className="text-body text-sm leading-relaxed">{m.bio}</p>
  </div>
);

export const TeamGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
    {team.map((m) => (
      <Reveal key={m.name}>
        <TeamCard m={m} />
      </Reveal>
    ))}
  </div>
);

export default TeamGrid;
