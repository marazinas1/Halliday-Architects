import { useEffect, useRef } from "react";

/** Fade-in-up on scroll, matching the site motion language. */
const Reveal = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger in milliseconds — used to cascade grids of cards. */
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
