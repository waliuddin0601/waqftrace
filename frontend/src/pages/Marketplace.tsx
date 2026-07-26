import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "../hooks/useSupabaseQuery";
import { supabase } from "../lib/supabase";
import CategoryBadge from "../components/CategoryBadge";
import type { Property } from "../lib/types";

export default function Marketplace() {
  const { data: properties, loading } = useProperties();
  const [inquiryFor, setInquiryFor] = useState<Property | null>(null);

  const listings = useMemo(
    () => properties.filter((p) => p.category === "land" || p.commercial_scope),
    [properties]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Commercial &amp; vacant land marketplace</h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-2xl">
          Properties with commercial scope or vacant land suited for lease. Express interest and the
          Waqf Board / caretaker on record will be notified to follow up — no payment happens here.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-ink-muted">No commercial-scope listings in the current dataset.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => (
            <div key={p.id} className="rounded-xl border border-[var(--border-hairline)] bg-surface p-4 shadow-sm hover:shadow-md transition">
              <CategoryBadge category={p.category} />
              <h3 className="mt-2 text-sm font-semibold truncate">{p.name}</h3>
              <p className="text-xs text-ink-muted mt-0.5">{[p.district, p.locality_ward].filter(Boolean).join(" · ")}</p>
              {p.area_text && <p className="text-xs text-ink-secondary mt-1">Area: {p.area_text}</p>}
              <button
                onClick={() => setInquiryFor(p)}
                className="mt-3 w-full rounded-md bg-series1 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Express interest
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-muted">
        Curious what fair rent should look like? See{" "}
        <Link to="/transparency" className="text-series1 hover:underline">real, sourced rent precedents</Link>.
      </p>

      {inquiryFor && <InquiryModal property={inquiryFor} onClose={() => setInquiryFor(null)} />}
    </div>
  );
}

function InquiryModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("lease_inquiries").insert({
      property_id: property.id,
      name,
      contact,
      message: message || null,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4 space-y-2">
            <div className="text-2xl">✅</div>
            <p className="text-sm text-ink-secondary">Interest recorded for <strong>{property.name}</strong>. You'll be contacted.</p>
            <button onClick={onClose} className="mt-2 text-sm text-series1">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold pr-4">Express interest: {property.name}</h3>
              <button type="button" onClick={onClose} className="text-ink-muted text-sm">✕</button>
            </div>
            <input
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[var(--border-hairline)] bg-page px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Phone or email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-md border border-[var(--border-hairline)] bg-page px-3 py-2 text-sm"
            />
            <textarea
              placeholder="What are you looking to do with this property? (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[var(--border-hairline)] bg-page px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-critical">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-series1 px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send inquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
