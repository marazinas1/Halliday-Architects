import { useEffect } from "react";
import { useLocation } from "@/lib/router-compat";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      let frame = 0;
      let attempts = 0;
      const scrollToHash = () => {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView({ block: "start" });
          return;
        }
        attempts += 1;
        if (attempts < 30) frame = window.requestAnimationFrame(scrollToHash);
      };
      frame = window.requestAnimationFrame(scrollToHash);
      return () => window.cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
