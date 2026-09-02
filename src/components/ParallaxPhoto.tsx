import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Subtle depth for a single hero photograph: the image sits slightly larger
 * than its frame and drifts a few percent slower than the scroll.
 *
 * Disabled below the `md` breakpoint (it fights momentum scrolling on phones)
 * and for anyone who prefers reduced motion.
 */
const ParallaxPhoto = ({
  children,
  strength = 0.12,
  className = "",
}: {
  children: ReactNode;
  /** Fraction of the scrolled distance the photograph lags behind. */
  strength?: number;
  className?: string;
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;
    if (!enabled) {
      inner.style.transform = "";
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      // Positive as the frame scrolls up out of view.
      const offset = Math.max(0, -rect.top) * strength;
      inner.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, strength]);

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={innerRef}
        className="absolute inset-0 will-change-transform"
        style={enabled ? { top: "-8%", bottom: "-8%", height: "auto" } : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default ParallaxPhoto;
