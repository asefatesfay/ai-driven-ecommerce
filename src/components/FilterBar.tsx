"use client";

import { FILTER_LABELS, type FilterRecipient, type FilterTheme, type FilterPrice } from "@/lib/data";

export interface ActiveFilters {
  recipient: FilterRecipient | null;
  theme: FilterTheme | null;
  price: FilterPrice | null;
}

interface FilterBarProps {
  filters: ActiveFilters;
  onFilterChange: (key: keyof ActiveFilters, value: string | null) => void;
  resultCount: number;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        whitespace-nowrap px-4 py-2 text-xs tracking-widest uppercase font-medium border transition-all duration-150
        ${
          active
            ? "bg-nordstrom-black text-white border-nordstrom-black"
            : "bg-white text-nordstrom-gray-700 border-nordstrom-gray-300 hover:border-nordstrom-black hover:text-nordstrom-black"
        }
      `}
    >
      {label}
    </button>
  );
}

export default function FilterBar({ filters, onFilterChange, resultCount }: FilterBarProps) {
  const hasActiveFilters = filters.recipient || filters.theme || filters.price;

  return (
    <div className="border-b border-nordstrom-gray-200 bg-white sticky top-[89px] z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        {/* Recipient filters */}
        <div className="mb-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-2">Shop For</p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(FILTER_LABELS.recipient) as [FilterRecipient, string][]).map(
              ([value, label]) => (
                <FilterChip
                  key={value}
                  label={label}
                  active={filters.recipient === value}
                  onClick={() =>
                    onFilterChange("recipient", filters.recipient === value ? null : value)
                  }
                />
              )
            )}
          </div>
        </div>

        {/* Theme + Price filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-2">Theme</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(FILTER_LABELS.theme) as [FilterTheme, string][]).map(
                ([value, label]) => (
                  <FilterChip
                    key={value}
                    label={label}
                    active={filters.theme === value}
                    onClick={() =>
                      onFilterChange("theme", filters.theme === value ? null : value)
                    }
                  />
                )
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-nordstrom-gray-500 mb-2">Price</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(FILTER_LABELS.price) as [FilterPrice, string][]).map(
                ([value, label]) => (
                  <FilterChip
                    key={value}
                    label={label}
                    active={filters.price === value}
                    onClick={() =>
                      onFilterChange("price", filters.price === value ? null : value)
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Result count + clear */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-nordstrom-gray-500">
            {resultCount} {resultCount === 1 ? "item" : "items"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                onFilterChange("recipient", null);
                onFilterChange("theme", null);
                onFilterChange("price", null);
              }}
              className="text-xs underline text-nordstrom-gray-500 hover:text-nordstrom-black transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
