import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyMap from "../components/PropertyMap";
import StatTile from "../components/StatTile";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import CategoryBadge, { categoryMeta } from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";
import { useProperties } from "../hooks/useSupabaseQuery";
import type { Property } from "../lib/types";

const CATEGORIES = ["mosque", "dargah", "graveyard", "ashoorkhana", "chillah", "land", "other"];

export default function Dashboard() {
  const { data: properties, loading: loadingProps } = useProperties();
  const navigate = useNavigate();

  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Property | null>(null);

  const districts = useMemo(
    () => Array.from(new Set(properties.map((p) => p.district).filter(Boolean))) as string[],
    [properties]
  );

  const filtered = useMemo(
    () =>
      properties.filter(
        (p) =>
          (districtFilter === "all" || p.district === districtFilter) &&
          (categoryFilter === "all" || p.category === categoryFilter)
      ),
    [properties, districtFilter, categoryFilter]
  );

  // Stats computed only from what we actually fetched and hold records for —
  // no extrapolated official totals mixed in here.
  const stats = useMemo(() => {
    const flaggedCount = properties.filter((p) => /encroach|litigation|dispute/i.test(p.status ?? "")).length;
    const geocoded = properties.filter((p) => p.lat != null && p.lon != null).length;
    return {
      total: properties.length,
      districts: districts.length,
      flaggedCount,
      geocoded,
    };
  }, [properties, districts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-series1 to-series7 px-6 py-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">Live Waqf land monitoring</h1>
        <p className="text-sm sm:text-base text-white/85 mt-2 max-w-2xl">
          Every property below is individually sourced — the official Waqf Board register, real court
          cases, or OpenStreetMap geodata. Nothing here is an extrapolated estimate.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Properties fetched" value={loadingProps ? "…" : stats.total.toLocaleString()} />
        <StatTile label="Districts covered" value={loadingProps ? "…" : stats.districts.toLocaleString()} />
        <StatTile
          label="Flagged (encroached / litigation)"
          value={loadingProps ? "…" : stats.flaggedCount.toLocaleString()}
          accent="var(--status-critical)"
          sublabel="from records we hold — not a district-wide estimate"
        />
        <StatTile label="Plotted on map" value={loadingProps ? "…" : stats.geocoded.toLocaleString()} sublabel="have coordinates" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="rounded-md border border-[var(--border-hairline)] bg-surface px-2 py-1.5 text-sm"
            >
              <option value="all">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-[var(--border-hairline)] bg-surface px-2 py-1.5 text-sm"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryMeta(c).label}</option>
              ))}
            </select>
            <span className="text-xs text-ink-muted">{filtered.length.toLocaleString()} shown</span>
          </div>
          <div className="h-[420px] rounded-lg border border-[var(--border-hairline)] overflow-hidden shadow-sm">
            <PropertyMap properties={filtered} onSelect={setSelected} />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const meta = categoryMeta(c);
              return (
                <span key={c} className="inline-flex items-center gap-1 text-xs text-ink-secondary">
                  <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {selected ? (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-ink-muted text-xs">✕</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <CategoryBadge category={selected.category} />
                <StatusBadge status={selected.status} />
              </div>
              {selected.district && <p className="mt-2 text-xs text-ink-secondary">{selected.district}{selected.locality_ward ? ` · ${selected.locality_ward}` : ""}</p>}
              <div className="mt-2 text-xs">
                <span className="text-ink-muted">Contact / caretaker: </span>
                <span className="text-ink-secondary">{selected.caretaker_mutawalli ?? "Not publicly available"}</span>
              </div>
              <button
                onClick={() => navigate(`/property/${selected.id}`)}
                className="mt-3 w-full rounded-md bg-series1 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                View full details
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border-hairline)] p-4 text-sm text-ink-muted">
              Click a marker on the map to see property details and contact info.
            </div>
          )}
          <CategoryBreakdownChart properties={filtered.length ? filtered : properties} />
        </div>
      </div>

      <DrillThroughTable properties={filtered} onSelect={(p) => navigate(`/property/${p.id}`)} />
    </div>
  );
}

function DrillThroughTable({ properties, onSelect }: { properties: Property[]; onSelect: (p: Property) => void }) {
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const paged = properties.slice(page * pageSize, (page + 1) * pageSize);
  const maxPage = Math.max(0, Math.ceil(properties.length / pageSize) - 1);

  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-surface overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] px-4 py-3">
        <h3 className="text-sm font-semibold">Drill-through: {properties.length.toLocaleString()} properties</h3>
        <div className="flex items-center gap-2 text-xs">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-30">◀</button>
          <span>{page + 1} / {maxPage + 1}</span>
          <button disabled={page === maxPage} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-30">▶</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-muted border-b border-[var(--border-hairline)]">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">District</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Contact / caretaker</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className="cursor-pointer border-b border-[var(--gridline)] last:border-0 hover:bg-page"
              >
                <td className="px-4 py-2 max-w-xs truncate">{p.name}</td>
                <td className="px-4 py-2"><CategoryBadge category={p.category} /></td>
                <td className="px-4 py-2 text-ink-secondary">{p.district ?? "—"}</td>
                <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-2 text-ink-secondary max-w-[160px] truncate">{p.caretaker_mutawalli ?? "Not available"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
