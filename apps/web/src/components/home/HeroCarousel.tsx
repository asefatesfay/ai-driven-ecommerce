"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { HERO_SLIDES } from "@/lib/home-data";

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive((a) => (a + 1) % HERO_SLIDES.length), []);
  const prev = () => setActive((a) => (a - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = HERO_SLIDES[active];

  return (
    <div
      className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-nordstrom-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Images — crossfade */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={s.imageUrl}
            alt={s.headline}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Scrim */}
      <div className={`absolute inset-0 ${slide.textLight ? "bg-black/30" : "bg-white/10"}`} />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pb-10 sm:pb-16 px-6 sm:px-12 lg:px-20">
        <div className="max-w-lg">
          <p className={`text-[10px] tracking-[0.25em] uppercase mb-2 ${slide.textLight ? "text-white/70" : "text-nordstrom-black/60"}`}>
            {slide.eyebrow}
          </p>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-light leading-tight mb-5 whitespace-pre-line ${slide.textLight ? "text-white" : "text-nordstrom-black"}`}
          >
            {slide.headline}
          </h2>
          <div className="flex flex-wrap gap-2">
            {slide.ctas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className={`text-[11px] tracking-widest uppercase px-5 py-2.5 font-medium transition-colors ${
                  slide.textLight
                    ? "bg-white text-nordstrom-black hover:bg-nordstrom-gray-100"
                    : "bg-nordstrom-black text-white hover:bg-nordstrom-gray-700"
                }`}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all duration-300 h-1 ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
