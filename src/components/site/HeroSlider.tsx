"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const slides = [
  { url: "/images/luxury_spa_slider_1.png", alt: "Luxury spa interior with warm golden lighting" },
  { url: "/images/luxury_spa_slider_2.png", alt: "Elegant champagne gold spa reception" },
  { url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1920&q=80", alt: "Minimalist luxury spa environment" }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  const currentRef = useRef(0);
  currentRef.current = current;

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(currentRef.current);
      setCurrent((c) => (c + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prevIndex === null) return;
    const t = setTimeout(() => setPrevIndex(null), 1050);
    return () => clearTimeout(t);
  }, [prevIndex]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
      {/* Lớp phủ sáng hơn để thấy rõ ảnh nền sang trọng, text vẫn dễ đọc */}
      <div className="absolute inset-0 bg-ink/35 z-20 pointer-events-none" />
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0) 30%, oklch(0.14 0.012 60 / 0.75) 100%)",
        }}
      />
      
      {slides.map((slide, index) => {
        const isActive = index === current;
        const isPrev = index === prevIndex;
        return (
          <div
            key={slide.url}
            style={{ willChange: "opacity" }}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : isPrev ? "opacity-100 z-0" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        );
      })}
    </div>
  );
}
