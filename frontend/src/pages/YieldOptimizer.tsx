import { useState } from "react";
import { callFunction } from "../lib/supabase";

type YieldResult = {
  locality_tier: string;
  base_rate_per_acre_per_year_inr: number;
  estimated_annual_yield_inr: number;
  estimated_monthly_rent_inr: number;
  recommended_use: string;
  method_note: string;
  ai_narrative: string | null;
};

const DISTRICTS = ["Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Sangareddy", "Nalgonda", "Warangal", "Nizamabad", "Adilabad", "Karimnagar", "Khammam", "Mahbubnagar", "Medak"];

export default function YieldOptimizer() {
  const [areaAcres, setAreaAcres] = useState("1");
  const [district, setDistrict] = useState("Hyderabad");
  const [commercialScope, setCommercialScope] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await callFunction<YieldResult>("yield-optimizer", {
        area_acres: parseFloat(areaAcres),
        district,
        commercial_scope: commercialScope,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compute an estimate right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Vacant land yield optimizer</h1>
        <p className="text-sm text-ink-secondary mt-2">
          A free, v1 estimate of rental yield and recommended use for vacant or under-utilized Waqf
          land — a transparent, locality-tier heuristic, narrated in plain language by Claude. Not a
          substitute for a professional valuation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-[var(--border-hairline)] bg-surface p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Area (acres)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={areaAcres}
              onChange={(e) => setAreaAcres(e.target.value)}
              className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={commercialScope} onChange={(e) => setCommercialScope(e.target.checked)} />
          Suitable for commercial use (road access, footfall)
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-series1 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Estimating…" : "Estimate yield"}
        </button>
        {error && <p className="text-sm text-critical">{error}</p>}
      </form>

      {result && (
        <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-muted">Est. annual yield</div>
              <div className="text-xl font-semibold tabular-nums">₹{result.estimated_annual_yield_inr.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-muted">Est. monthly rent</div>
              <div className="text-xl font-semibold tabular-nums">₹{result.estimated_monthly_rent_inr.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-muted">Recommended use</div>
            <div className="text-sm text-ink">{result.recommended_use}</div>
          </div>
          {result.ai_narrative && (
            <div className="rounded-md bg-page p-3 text-sm text-ink-secondary">{result.ai_narrative}</div>
          )}
          <p className="text-xs text-ink-muted">{result.method_note}</p>
        </div>
      )}
    </div>
  );
}
