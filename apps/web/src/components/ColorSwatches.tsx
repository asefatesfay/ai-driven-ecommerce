"use client";

import type { ProductColor } from "@/lib/catalog-data";

interface ColorSwatchesProps {
  colors: ProductColor[];
  selected: number;
  onSelect: (index: number) => void;
  max?: number;
}

export default function ColorSwatches({ colors, selected, onSelect, max = 5 }: ColorSwatchesProps) {
  if (colors.length === 0) return null;

  const visible = colors.slice(0, max);
  const overflow = colors.length - max;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((color, i) => (
        <button
          key={color.name}
          title={color.name}
          aria-label={color.name}
          onClick={(e) => { e.preventDefault(); onSelect(i); }}
          className={`w-4 h-4 rounded-full border-2 transition-all flex-shrink-0 ${
            selected === i
              ? "border-nordstrom-black scale-110"
              : "border-transparent hover:border-nordstrom-gray-300"
          }`}
          style={{ backgroundColor: color.hex }}
        />
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-nordstrom-gray-500">+{overflow}</span>
      )}
    </div>
  );
}
