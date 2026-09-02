import { Suspense, lazy, useEffect, useRef, useState } from "react";

/**
 * The map is the single heaviest thing on the site (MapLibre is larger than
 * every other page's JavaScript combined), so its chunk is only requested once
 * the visitor scrolls near it. Until then a placeholder of the exact final
 * height holds the space, so nothing jumps when the map appears.
 */
const ContactMap = lazy(() => import("@/components/ContactMap"));

const BAND_CLASSES = "h-[340px] w-full border-y border-line bg-sand md:h-[500px]";

const Placeholder = () => (
  <div className={BAND_CLASSES} aria-hidden="true">
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-[11px] uppercase tracking-[0.2em] text-stone">
        Ocean City, New Jersey
      </span>
    </div>
  </div>
);

const ContactMapSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [show]);

  return (
    <div ref={ref}>
      {show ? (
        <Suspense fallback={<Placeholder />}>
          <ContactMap />
        </Suspense>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

export default ContactMapSection;
