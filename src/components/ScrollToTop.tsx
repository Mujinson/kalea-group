import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Use useLayoutEffect to scroll before paint, preventing flash of wrong position
  useLayoutEffect(() => {
    // Immediate scroll
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Fallback with useEffect for cases where layoutEffect isn't enough
  useEffect(() => {
    // Small delay to handle any async content loading
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
