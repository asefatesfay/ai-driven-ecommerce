"use client";

import Image from "next/image";
import type { ProductVariantColor } from "@/lib/product-data";

interface ColorSelectorProps {
  colors: ProductVariantColor[];
  selected: number;
  onSelect: (i: number) => void;
}

export default function ColorSelector({ colors, selected, onSelect }: ColorSelectorProps) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-xs font-medium text-nordstrom-black">Color:</span>
        <span className="text-xs text-nordstrom-gray-700">{colors[selected].name}</span>
        {colors[selected].soldOut && (
          <span className="text-[10px] text-nordstrom-gray-500 italic">— sold out</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <button
            key={color.name}
            title={color.name}
            onClick={() => onSelect(i)}
            className={`relative w-12 h-12 overflow-hidden border-2 transition-all ${
              selected === i
                ? "border-nordstrom-black"
                : "border-transparent hover:border-nordstrom-gray-300"
            } ${color.soldOut ? "opacity-40" : ""}`}
          >
            <Image
              src={color.imageUrl}
              alt={color.name}
              fill
              className="object-cover"
              sizes="48px"
            />
            {color.soldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-nordstrom-gray-500 rotate-45 absolute" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
