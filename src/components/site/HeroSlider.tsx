"use client";
import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useState } from "react";

import { heroSlides } from "@/data/directory";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";

type Category = { slug: string; name: string };
type Location = { slug: string; name: string };

type Props = {
  categories?: Category[];
  locations?: Location[];
};

export function HeroSlider({ categories = [], locations = [] }: Props) {
  const [index, setIndex] = useState(0);
  const active = heroSlides[index]!;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[86vh] w-full overflow-hidden bg-ink">
      {heroSlides.map((slide, i) => (
        <div
          key={slide.title}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <NextImage
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              "object-cover transition-transform duration-[7000ms] ease-out",
              i === index ? "scale-105" : "scale-100",
            )}
          />

          <div className="absolute inset-0 bg-ink/55" />
          <div className="overlay-ink absolute inset-0" />
        </div>
      ))}

      <div className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-end gap-8 px-6 pt-32 pb-16">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.35em] text-gold uppercase">
            {active.kicker}
          </p>
          <div className="rule-gold mt-4" />
          <h1 className="mt-6 text-4xl leading-tight text-background md:text-6xl">
            {active.title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-background/75">
            {active.description}
          </p>
          <Link
            href="/tim-kiem"
            className="mt-8 inline-flex rounded-sm border border-gold/60 px-7 py-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase transition-colors hover:bg-gold hover:text-ink"
          >
            {active.cta}
          </Link>
        </div>

        {/* SearchBar nhận categories/locations từ server (không fetch lại) */}
        <SearchBar categories={categories} locations={locations} />

        <div className="flex gap-2">
          {heroSlides.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "h-0.5 w-12 transition-all",
                i === index ? "bg-gradient-gold" : "bg-background/30",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
