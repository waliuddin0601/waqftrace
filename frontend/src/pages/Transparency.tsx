import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "../hooks/useSupabaseQuery";
import CategoryBadge from "../components/CategoryBadge";

const KNOWN_PRECEDENTS = [
  {
    property: "Madina Commercial Complex, near Charminar, Hyderabad",
    detail:
      "500+ shops built during the Nizam era for Hajj/pilgrim welfare. Fair annual revenue should exceed ₹6 crore, but decades-old nominal rents plus defaults have let arrears balloon to roughly ₹30 crore.",
    source: "https://thefederal.com/category/states/south/telangana/telangana-waqf-board-encroachments-revenue-waqf-properties-180127",
  },
  {
    property: "Board-wide rent collection vs. holdings",
    detail:
      "The Board controls ~20,110 acres directly, yet collects only ~₹5 crore/year in rent across its entire portfolio — a stark gap between land value and realized income.",
    source: "https://thefederal.com/category/states/south/telangana/telangana-waqf-board-encroachments-revenue-waqf-properties-180127",
  },
  {
    property: "Jodhpur commercial tenant dispute (Rajasthan Waqf Board)",
    detail:
      "A mutawalli tried to raise rent from ₹7,700/month to ₹50,000/month (10% of market value), disputed as exceeding the statutory 2.5% commercial reserve-price rule.",
    source: "https://www.vidhikarya.com/FreeLegalAdvice/50671/waqf-rent-related-matter",
  },
  {
    property: "2,186 properties with missing records",
    detail: "The Telangana Waqf Board admitted in the High Court that records for 2,186 properties are missing entirely — the exact opacity this platform exists to close.",
    source: "https://thefederal.com/category/states/south/telangana/telangana-waqf-board-encroachments-revenue-waqf-properties-180127",
  },
];

const WELFARE_PRECEDENTS = [
  { name: "UMEED Portal maintenance module (2025)", who: "widows, divorced women, orphans", detail: "Aadhaar-authenticated online applications, funds via Direct Benefit Transfer." },
  { name: "Central Waqf Council scholarships & fellowships", who: "students, M.Phil/Ph.D scholars", detail: "≥30% of awards reserved for women; State Boards get 50%-matching grants for Classes IX–XII and madrasa education." },
  { name: "Karnataka Bidaai/Shaadi Bhagya scheme", who: "poor girls' marriage", detail: "₹50,000 per beneficiary for household essentials at marriage." },
  { name: "Punjab Waqf Board Pension Policy", who: "widows, disabled, elderly", detail: "Tracks state Social Security pension rate (₹750/month, proposed ₹1,500)." },
  { name: "Telangana mass marriages & orphanage sponsorship", who: "poor families, orphans", detail: "Ongoing program; per-beneficiary figures not published — exactly the gap a transparent ledger would fix." },
];

export default function Transparency() {
  const { data: properties, loading } = useProperties();
  const commercial = useMemo(() => properties.filter((p) => p.commercial_scope), [properties]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Commercial land transparency</h1>
        <p className="text-sm text-ink-secondary mt-2">
          No public source in India currently discloses live tenant names or rent amounts for Waqf
          property at scale — a Telangana Waqf Board member publicly demanded exactly this disclosure
          in June 2026. That gap is this product's reason to exist. Below: properties in our dataset
          flagged as commercial-scope, and the real, sourced precedents that ground the feature.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold mb-3">Flagged commercial-scope properties {loading ? "" : `(${commercial.length})`}</h2>
        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : commercial.length === 0 ? (
          <p className="text-sm text-ink-muted">None flagged in the current dataset.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {commercial.map((p) => (
              <Link
                key={p.id}
                to={`/property/${p.id}`}
                className="rounded-lg border border-[var(--border-hairline)] bg-surface p-3 hover:shadow-sm"
              >
                <CategoryBadge category={p.category} />
                <div className="mt-1.5 text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-ink-muted">{p.district}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Real, sourced precedents</h2>
        <div className="space-y-3">
          {KNOWN_PRECEDENTS.map((item) => (
            <div key={item.property} className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4">
              <div className="font-medium text-sm">{item.property}</div>
              <p className="text-sm text-ink-secondary mt-1">{item.detail}</p>
              <a href={item.source} target="_blank" rel="noopener noreferrer" className="text-xs text-series1 hover:underline">
                source
              </a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Lease rules (what rent should legally be)</h2>
        <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4 text-sm text-ink-secondary space-y-1">
          <p><strong className="text-ink">Educational / social use:</strong> 1–2% of market value per year (range reflects conflicting sources on the 2020 amendment — cited, not invented).</p>
          <p><strong className="text-ink">Commercial use:</strong> 1.5–2.5% of market value per year.</p>
          <p><strong className="text-ink">Long-term leases (up to 30 years):</strong> require State Government approval; deemed granted if no response within 45 days.</p>
          <p className="text-xs text-ink-muted mt-2">Source: Waqf Properties Lease Rules 2014 &amp; 2015/2020 amendments.</p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Where surplus should reach — real precedent programs</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {WELFARE_PRECEDENTS.map((w) => (
            <div key={w.name} className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4">
              <div className="text-sm font-medium">{w.name}</div>
              <div className="text-xs text-series1 mt-0.5">{w.who}</div>
              <p className="text-sm text-ink-secondary mt-1">{w.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
