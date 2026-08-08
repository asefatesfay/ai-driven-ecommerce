"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnail strip */}
      <div className="hidden sm:flex flex-col gap-2 w-16 flex-shrink-0">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative aspect-[3/4] w-full overflow-hidden border-2 transition-colors ${
              active === i ? "border-nordstrom-black" : "border-transparent hover:border-nordstrom-gray-300"
            }`}
          >
            <Image
              src={src}
              alt={`${productName} view ${i + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 flex flex-col gap-2">
        <div
          className={`relative aspect-[3/4] overflow-hidden bg-nordstrom-gray-50 cursor-zoom-in ${zoomed ? "cursor-zoom-out" : ""}`}
          onClick={() => setZoomed(!zoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomed(false)}
        >
          <Image
            src={images[active]}
            alt={productName}
            fill
            className={`object-cover transition-transform duration-100 ${zoomed ? "scale-[2]" : "scale-100"}`}
            style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {/* Zoom hint */}
          {!zoomed && (
            <div className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 text-[9px] tracking-widest uppercase text-nordstrom-gray-500 hidden md:block">
              Hover to zoom
            </div>
          )}
        </div>

        {/* Mobile thumbnail dots */}
        <div className="flex sm:hidden justify-center gap-1.5 pt-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                active === i ? "bg-nordstrom-black" : "bg-nordstrom-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Mobile prev/next */}
        <div className="flex sm:hidden justify-between absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 pointer-events-none">
          <button
            className="pointer-events-auto bg-white/90 p-1.5 disabled:opacity-30"
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="pointer-events-auto bg-white/90 p-1.5 disabled:opacity-30"
            onClick={() => setActive((a) => Math.min(images.length - 1, a + 1))}
            disabled={active === images.length - 1}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
