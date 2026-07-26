import { useMemo, useState } from "react";
import type { Property } from "../lib/types";
import CategoryBadge from "./CategoryBadge";

export default function PropertySearch({
  properties,
  onSelect,
  placeholder = "Search by name or district…",
}: {
  properties: Property[];
  onSelect: (p: Property) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return properties
      .filter((p) => p.name.toLowerCase().includes(q) || (p.district ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, properties]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border-hairline)] bg-surface shadow-lg max-h-64 overflow-y-auto">
          {results.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                onSelect(p);
                setQuery(p.name);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page"
            >
              <span className="truncate">{p.name}</span>
              <span className="flex shrink-0 items-center gap-2">
                <CategoryBadge category={p.category} />
                <span className="text-xs text-ink-muted">{p.district}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
