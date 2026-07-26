import { Link, useParams } from "react-router-dom";
import { useProperty } from "../hooks/useSupabaseQuery";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";

export default function PropertyDetail() {
  const { id } = useParams();
  const { data: property, loading } = useProperty(id);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-ink-muted">Loading…</div>;
  if (!property) return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-ink-muted">Property not found.</div>;

  const boundaries = (property.boundaries as { raw?: unknown } | null)?.raw;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Link to="/" className="text-sm text-series1 hover:underline">← Back to dashboard</Link>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <CategoryBadge category={property.category} />
          <StatusBadge status={property.status} />
          {property.commercial_scope && (
            <span className="rounded-full bg-series4/10 px-2 py-0.5 text-xs font-medium text-series4">
              Commercial scope
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold">{property.name}</h1>
        <p className="text-sm text-ink-secondary mt-1">
          {[property.district, property.locality_ward, property.address_text].filter(Boolean).join(" · ")}
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-[var(--border-hairline)] bg-surface p-4 text-sm">
        <Field label="Survey number" value={property.survey_number} />
        <Field label="Area" value={property.area_text} />
        <Field label="Caretaker / Muttawali" value={property.caretaker_mutawalli} />
        <Field label="Estimated value" value={property.estimated_value_inr} />
        {boundaries != null && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Boundaries</dt>
            <dd className="mt-0.5 text-ink-secondary whitespace-pre-wrap">
              {typeof boundaries === "string" ? boundaries : JSON.stringify(boundaries)}
            </dd>
          </div>
        )}
        {property.litigation && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Litigation</dt>
            <dd className="mt-0.5 text-ink-secondary">
              {property.litigation.case_name || property.litigation.note}
            </dd>
          </div>
        )}
      </dl>

      <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4 text-xs text-ink-muted">
        Source: {property.source_type ?? "unknown"}
        {property.source_url && (
          <>
            {" — "}
            <a href={property.source_url} target="_blank" rel="noopener noreferrer" className="text-series1 hover:underline">
              view original
            </a>
          </>
        )}
        {property.is_demo_placeholder && (
          <div className="mt-1 text-series4">⚠ Illustrative / demo data — not independently verified.</div>
        )}
      </div>

      <Link
        to={`/report?property=${property.id}`}
        className="inline-block rounded-md bg-critical px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Report an issue with this property
      </Link>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
