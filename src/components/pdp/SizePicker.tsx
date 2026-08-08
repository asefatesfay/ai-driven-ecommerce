"use client";

interface SizePickerProps {
  sizes: { label: string; soldOut?: boolean }[];
  selected: string | null;
  onSelect: (s: string) => void;
  fitNote: string;
  error?: boolean;
}

export default function SizePicker({ sizes, selected, onSelect, fitNote, error }: SizePickerProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-nordstrom-black">Size:</span>
          {selected ? (
            <span className="text-xs text-nordstrom-gray-700">{selected}</span>
          ) : (
            <span className={`text-xs ${error ? "text-red-600" : "text-nordstrom-gray-500"}`}>
              {error ? "Please select a size" : "Select a size"}
            </span>
          )}
        </div>
        <button className="text-xs underline text-nordstrom-gray-500 hover:text-nordstrom-black transition-colors">
          Size guide
        </button>
      </div>

      {/* Fit note */}
      <p className="text-[11px] text-nordstrom-gray-500 mb-3 flex items-center gap-1">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {fitNote}
      </p>

      <div className="flex flex-wrap gap-2">
        {sizes.map(({ label, soldOut }) => (
          <button
            key={label}
            onClick={() => !soldOut && onSelect(label)}
            disabled={soldOut}
            className={`
              min-w-[44px] h-10 px-2 border text-xs font-medium transition-all relative
              ${soldOut
                ? "border-nordstrom-gray-200 text-nordstrom-gray-300 cursor-not-allowed line-through"
                : selected === label
                ? "border-nordstrom-black bg-nordstrom-black text-white"
                : "border-nordstrom-gray-300 text-nordstrom-gray-700 hover:border-nordstrom-black hover:text-nordstrom-black"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
