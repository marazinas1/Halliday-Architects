import { useEffect, useRef, useState } from "react";

/** Fade-in-up on scroll, matching the site motion language.
 *
 * The animation is an enhancement, never a precondition: content is visible
 * by default when IntersectionObserver is unavailable, the user prefers
 * reduced motion, or a safety timeout expires. Nothing is ever permanently
 * invisible. Elements already on screen at mount still animate in — they just
 * do not wait for a scroll event. */
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

    let raf = 0;

    // Match framer-motion's whileInView: trigger as soon as any part of the
    // element enters the viewport (threshold 0, no root margin), once only.
    // Elements already in view at mount reveal on the next frame.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      raf = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px" },
    );
    observer.observe(el);

    // Safety net: if the observer never fires within 2500ms while the element
    // is on screen, reveal anyway.
    const timeout = window.setTimeout(() => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        setVisible(true);
        observer.disconnect();
      }
    }, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-[30px]"
      } transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0,0,0.58,1)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
