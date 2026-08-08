interface ActiveFilterPillsProps {
  activeFilters: Record<string, string | null>;
  labelMap: Record<string, Record<string, string>>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilterPills({
  activeFilters,
  labelMap,
  onRemove,
  onClearAll,
}: ActiveFilterPillsProps) {
  const active = Object.entries(activeFilters).filter(([, v]) => v !== null) as [string, string][];
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {active.map(([key, value]) => {
        const label = labelMap[key]?.[value] ?? value;
        return (
          <button
            key={key}
            onClick={() => onRemove(key)}
            className="flex items-center gap-1.5 text-xs border border-nordstrom-gray-300 px-3 py-1.5 hover:border-nordstrom-black transition-colors group"
          >
            <span className="text-nordstrom-gray-700 group-hover:text-nordstrom-black">{label}</span>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-nordstrom-gray-400 group-hover:text-nordstrom-black"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        );
      })}
      {active.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-nordstrom-gray-500 underline hover:text-nordstrom-black transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
