"use client";

import { useState } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterAccordionProps {
  title: string;
  filterKey: string;
  options: FilterOption[];
  activeValue: string | null;
  onToggle: (key: string, value: string) => void;
}

export default function FilterAccordion({
  title,
  filterKey,
  options,
  activeValue,
  onToggle,
}: FilterAccordionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-nordstrom-gray-200 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-nordstrom-gray-700 group-hover:text-nordstrom-black transition-colors">
          {title}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-nordstrom-gray-500 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="mt-3 space-y-2">
          {options.map((opt) => {
            const isActive = activeValue === opt.value;
            return (
              <li key={opt.value}>
                <button
                  onClick={() => onToggle(filterKey, opt.value)}
                  className="flex items-center gap-2.5 text-xs w-full text-left group/item"
                >
                  <span
                    className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center transition-colors ${
                      isActive
                        ? "border-nordstrom-black bg-nordstrom-black"
                        : "border-nordstrom-gray-300 group-hover/item:border-nordstrom-gray-500"
                    }`}
                  >
                    {isActive && (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`transition-colors ${
                      isActive
                        ? "text-nordstrom-black font-medium"
                        : "text-nordstrom-gray-700 group-hover/item:text-nordstrom-black"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
