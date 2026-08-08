"use client";

interface SizeSelectorProps {
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ sizes, selected, onSelect }: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={(e) => { e.preventDefault(); onSelect(size); }}
          className={`text-[10px] px-2 py-1 border transition-colors min-w-[28px] text-center leading-none ${
            selected === size
              ? "border-nordstrom-black bg-nordstrom-black text-white"
              : "border-nordstrom-gray-300 text-nordstrom-gray-700 hover:border-nordstrom-black hover:text-nordstrom-black"
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
