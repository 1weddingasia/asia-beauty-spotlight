"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const bumpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when route change completes
  useEffect(() => {
    if (isNavigating) {
      if (bumpTimerRef.current) clearTimeout(bumpTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on links to show immediate feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only handle internal relative links
      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("download") &&
        target.getAttribute("target") !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // If clicking hash or exact current URL, skip
        const currentUrl = window.location.pathname + window.location.search;
        if (href === currentUrl || href === window.location.pathname || href.startsWith("#")) {
          return;
        }

        if (bumpTimerRef.current) clearTimeout(bumpTimerRef.current);
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

        setIsNavigating(true);
        setProgress(30);

        bumpTimerRef.current = setTimeout(() => {
          setProgress((prev) => (prev < 80 ? 75 : prev));
        }, 150);

        // Safety fallback: if navigation fails or aborts, reset after 4s
        safetyTimerRef.current = setTimeout(() => {
          setIsNavigating(false);
          setProgress(0);
        }, 4000);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (bumpTimerRef.current) clearTimeout(bumpTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-gold to-yellow-200 shadow-[0_0_10px_rgba(212,175,55,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 0.15s ease-out, opacity 0.25s ease-out 0.1s" : "width 0.2s ease-out",
        }}
      />
    </div>
  );
}
