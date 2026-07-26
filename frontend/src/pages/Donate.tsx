import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "../hooks/useSupabaseQuery";
import { supabase } from "../lib/supabase";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";
import type { Property } from "../lib/types";

const PURPOSES = [
  { value: "masjid_construction", label: "Build / restore a masjid" },
  { value: "school", label: "Build a school" },
  { value: "orphanage", label: "Support an orphanage" },
  { value: "general", label: "General development fund" },
];

export default function Donate() {
  const { data: properties, loading } = useProperties();
  const [selected, setSelected] = useState<Property | null>(null);

  const opportunities = useMemo(
    () => properties.filter((p) => p.category === "land" || /encroach|vacant/i.test(p.status ?? "")),
    [properties]
  );

  if (selected) {
    return <DonationForm property={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Donate toward Waqf land development</h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-2xl">
          Pick a property that needs recovery, a masjid, a school, or general development, and
          contribute toward it. 100% earmarked and tracked against the property you choose.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : opportunities.length === 0 ? (
        <p className="text-sm text-ink-muted">No development-opportunity properties in the current dataset.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((p) => (
            <div key={p.id} className="rounded-xl border border-[var(--border-hairline)] bg-surface p-4 shadow-sm hover:shadow-md transition">
              <div className="flex flex-wrap gap-1.5">
                <CategoryBadge category={p.category} />
                <StatusBadge status={p.status} />
              </div>
              <h3 className="mt-2 text-sm font-semibold truncate">{p.name}</h3>
              <p className="text-xs text-ink-muted mt-0.5">{[p.district, p.locality_ward].filter(Boolean).join(" · ")}</p>
              {p.area_text && <p className="text-xs text-ink-secondary mt-1">Area: {p.area_text}</p>}
              <button
                onClick={() => setSelected(p)}
                className="mt-3 w-full rounded-md bg-good px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Donate toward this
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-ink-muted">
        See where surplus has historically gone — real programs, real gaps —{" "}
        <Link to="/transparency" className="text-series1 hover:underline">on the transparency page</Link>.
      </p>
    </div>
  );
}

function DonationForm({ property, onBack }: { property: Property; onBack: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("1000");
  const [purpose, setPurpose] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("donations").insert({
      property_id: property.id,
      donor_name: name || null,
      donor_contact: contact || null,
      amount: parseFloat(amount),
      purpose,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-3">
        <div className="text-3xl">🤲</div>
        <h1 className="text-xl font-semibold">Jazakallah khair</h1>
        <p className="text-sm text-ink-secondary">
          Your pledge of ₹{Number(amount).toLocaleString("en-IN")} toward <strong>{property.name}</strong> has
          been recorded. Payment integration is a demo placeholder — no money has moved.
        </p>
        <button onClick={onBack} className="text-sm text-series1">← Back to listings</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <button onClick={onBack} className="text-sm text-series1 mb-4">← Back to listings</button>
      <h1 className="text-lg font-semibold">Donate toward</h1>
      <p className="text-sm text-ink-secondary mb-4">{property.name}</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Purpose</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          >
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount (₹)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          />
          <input
            placeholder="Contact (optional)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="rounded-md border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-critical">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-good px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Processing…" : "Confirm pledge (demo, no real payment)"}
        </button>
      </form>
    </div>
  );
}
