import { useLitigationCases } from "../hooks/useSupabaseQuery";

export default function Legal() {
  const { data: cases, loading } = useLitigationCases();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Legal case tracker</h1>
        <p className="text-sm text-ink-secondary mt-2">
          {loading ? "Loading…" : `${cases.length} real court cases`} — Supreme Court, Andhra Pradesh High
          Court, and Telangana High Court records (1974–2026) involving the Waqf Board, sourced from
          Indian Kanoon.
        </p>
      </div>

      <div className="space-y-3">
        {cases.map((c) => (
          <div key={c.id} className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">{c.case_name}</h3>
              <span className="text-xs text-ink-muted">{c.court} {c.year && `· ${c.year}`}</span>
            </div>
            {c.citation && <p className="text-xs text-ink-muted mt-0.5">{c.citation}</p>}
            {c.property_involved && (
              <p className="text-sm text-ink-secondary mt-2">
                <strong className="text-ink">Property:</strong> {c.property_involved}
              </p>
            )}
            {c.dispute_summary && <p className="text-sm text-ink-secondary mt-1">{c.dispute_summary}</p>}
            {c.outcome_status && (
              <p className="text-sm mt-1">
                <strong className="text-ink">Status:</strong> <span className="text-ink-secondary">{c.outcome_status}</span>
              </p>
            )}
            {c.source_url && (
              <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-series1 hover:underline mt-2 inline-block">
                view on Indian Kanoon
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
