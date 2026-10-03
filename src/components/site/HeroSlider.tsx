"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  { url: "/images/luxury_spa_slider_1.png", alt: "Luxury spa interior with warm golden lighting" },
  { url: "/images/luxury_spa_slider_2.png", alt: "Elegant champagne gold spa reception" },
  { url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1920&q=80", alt: "Minimalist luxury spa environment" }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Lớp phủ đen để chữ dễ đọc */}
      <div className="absolute inset-0 bg-ink/75 md:bg-ink/60 z-10 mix-blend-multiply" />
      
      {slides.map((slide, index) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.url}
            alt={slide.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
