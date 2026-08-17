/** Shared internal-page hero: parallax architectural image with dark overlay. */
const PageHero = ({
  eyebrow,
  title,
  image,
}: {
  eyebrow: string;
  title: string;
  image?: string;
}) => {
  return (
    <section className="relative h-[55vh] min-h-[360px] flex items-center justify-center overflow-hidden bg-ink">
      {/* Flat ink block stands in until the client's photography arrives —
          swap in <img src={image} … /> when it does. */}
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <p className="label-uppercase text-paper/70 mb-4">{eyebrow}</p>
        <h1 className="heading-display text-paper">{title}</h1>
      </div>
    </section>
  );
};

export default PageHero;
