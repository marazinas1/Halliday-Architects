import { useEffect, useRef, useState } from "react";

/** Fade-in-up on scroll, matching the site motion language.
 *
 * The animation is an enhancement, never a precondition: content is visible
 * by default when IntersectionObserver is unavailable, the element is already
 * on screen, the user prefers reduced motion, or a 1200ms safety timeout
 * expires. Nothing is ever permanently invisible. */
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver support (legacy browsers, crawlers, print
    // renderers) — show immediately, no observer.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    // Respect reduced-motion preference: skip the animation entirely.
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    // If the element is already in or above the viewport on mount, reveal it
    // right away so above-the-fold content never waits for a scroll event.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);

    // Safety net: if the observer never fires within 1200ms, reveal anyway.
    const timeout = window.setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

  const hidden = !visible;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`${hidden ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"} transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
