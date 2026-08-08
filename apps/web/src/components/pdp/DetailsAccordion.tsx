"use client";

import { useState } from "react";

interface Section {
  label: string;
  items: string[];
}

export default function DetailsAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<string | null>(sections[0]?.label ?? null);

  return (
    <div className="border-t border-nordstrom-gray-200">
      {sections.map((section) => {
        const isOpen = open === section.label;
        return (
          <div key={section.label} className="border-b border-nordstrom-gray-200">
            <button
              onClick={() => setOpen(isOpen ? null : section.label)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <span className="text-xs font-medium tracking-wide text-nordstrom-black group-hover:text-nordstrom-gray-700 transition-colors">
                {section.label}
              </span>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                className={`flex-shrink-0 text-nordstrom-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen && (
              <ul className="pb-4 space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-nordstrom-gray-700 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-nordstrom-gray-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
