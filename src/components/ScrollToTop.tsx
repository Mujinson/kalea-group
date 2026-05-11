import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // Use useLayoutEffect to scroll before paint, preventing flash of wrong position
  useLayoutEffect(() => {
    if (hash) return; // let hash effect handle it
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  // Hash-aware scroll: scroll to anchor if hash present, else top
  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, "");
      // Try a few times to wait for DOM (sections animate in)
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts < 20) {
          attempts++;
          setTimeout(tryScroll, 100);
        }
      };
      tryScroll();
      return;
    }
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
