function StepCard({
  icon, title, detail, color,
}: { icon: string; title: string; detail: string; color: string }) {
  return (
    <div
      className="w-full sm:w-64 rounded-xl border border-[var(--border-hairline)] bg-surface p-4 text-center shadow-sm"
      style={{ boxShadow: `0 0 0 1px ${color}33` }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: `${color}1f` }}
      >
        {icon}
      </div>
      <h4 className="mt-2 text-sm font-semibold text-ink">{title}</h4>
      <p className="mt-1 text-xs text-ink-secondary leading-relaxed">{detail}</p>
    </div>
  );
}

function DownArrow({ color = "var(--text-muted)" }: { color?: string }) {
  return (
    <div className="flex justify-center py-1 text-2xl leading-none" style={{ color }} aria-hidden>
      ↓
    </div>
  );
}

const EXTERNAL_INPUTS = [
  { icon: "🚨", title: "Outside reporting", detail: "Citizens report encroachment / illegal sale / corruption, with photos", color: "var(--status-critical)" },
  { icon: "🤲", title: "Outside donors", detail: "Public pledges toward specific development-opportunity properties", color: "var(--status-good)" },
  { icon: "📋", title: "Outside registrations", detail: "Orphans, widows, communal-violence families, institutions needing funds", color: "var(--series-4)" },
];

const OUTPUT_VIEWS = [
  { icon: "🕌", title: "Mosque", color: "var(--series-1)" },
  { icon: "🕋", title: "Dargah", color: "var(--series-7)" },
  { icon: "⚰️", title: "Graveyard", color: "var(--series-4)" },
  { icon: "🏗️", title: "Commercial / land", color: "var(--series-2)" },
];

export default function PipelineDiagram() {
  return (
    <div className="flex flex-col items-center gap-1">
      <StepCard
        icon="📥"
        title="1. Raw sources"
        detail="Government registers, court records, OSM, news, WAMSI mirror (see cards above)"
        color="var(--series-1)"
      />
      <DownArrow color="var(--series-1)" />
      <StepCard
        icon="🧮"
        title="2. Programmatic extraction"
        detail="PDF table parsing, web scraping, geocoding — no manual data entry"
        color="var(--series-7)"
      />
      <DownArrow color="var(--series-7)" />

      <StepCard
        icon="🗄️"
        title="3. Structured SQL database"
        detail="Supabase Postgres, row-level security, 1,074+ property rows"
        color="var(--series-3)"
      />

      {/* External inputs merge into the database from the side */}
      <div className="my-3 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border-hairline)] p-3">
        <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide">also feeds into the database ↑</div>
        <div className="flex flex-wrap justify-center gap-3">
          {EXTERNAL_INPUTS.map((e) => (
            <div
              key={e.title}
              className="w-40 rounded-lg border border-[var(--border-hairline)] bg-page p-3 text-center"
              style={{ boxShadow: `0 0 0 1px ${e.color}33` }}
            >
              <div className="text-xl">{e.icon}</div>
              <div className="mt-1 text-xs font-semibold text-ink">{e.title}</div>
              <div className="mt-0.5 text-[11px] text-ink-secondary leading-snug">{e.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <DownArrow color="var(--series-3)" />
      <StepCard
        icon="📍"
        title="4. Geo-tagging"
        detail="Lat/lon assigned from OSM + address matching, for every mappable property"
        color="var(--series-5)"
      />
      <DownArrow color="var(--series-5)" />
      <StepCard
        icon="🗺️"
        title="5. Map pinning &amp; drill-through"
        detail="Live dashboard map — filter, click, and drill into any property"
        color="var(--series-6)"
      />
      <DownArrow color="var(--series-6)" />

      <div className="w-full">
        <div className="text-center text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
          6. Branches into category &amp; use-case views
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {OUTPUT_VIEWS.map((o) => (
            <div
              key={o.title}
              className="w-32 rounded-lg border border-[var(--border-hairline)] bg-surface p-3 text-center shadow-sm"
              style={{ borderTopWidth: 3, borderTopColor: o.color }}
            >
              <div className="text-xl">{o.icon}</div>
              <div className="mt-1 text-xs font-semibold text-ink">{o.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
