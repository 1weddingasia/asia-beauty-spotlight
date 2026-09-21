"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!showTopBtn) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[999] grid size-10 md:size-12 place-items-center rounded-full bg-gold text-ink shadow-lg transition-transform hover:scale-110 active:scale-95 hover:shadow-xl"
    >
      <ArrowUp className="size-5 md:size-6" />
    </button>
  );
}
