const SOURCES = [
  {
    icon: "🏛️",
    name: "Telangana State Waqf Board",
    stat: "340 properties",
    color: "var(--series-1)",
    detail: "Official 398-page \"Kitabul Aukaf\" Hyderabad register — programmatically extracted with names, survey numbers, boundaries, and muttawali (caretaker) names.",
    url: "https://waqf.telangana.gov.in/properties/",
  },
  {
    icon: "⚖️",
    name: "Indian Kanoon",
    stat: "17 court cases",
    color: "var(--series-7)",
    detail: "Real Supreme Court &amp; High Court judgments (1974–2026) — encroachment, illegal sale, tenancy, and mutawalli-succession disputes.",
    url: "https://indiankanoon.org",
  },
  {
    icon: "🗺️",
    name: "OpenStreetMap",
    stat: "704 geocoded sites",
    color: "var(--series-3)",
    detail: "Real lat/lon coordinates for 603 mosques, 42 dargahs, and 59 graveyards across Telangana — the dashboard's map layer.",
    url: "https://www.openstreetmap.org",
  },
  {
    icon: "📰",
    name: "News archives",
    stat: "29 named cases",
    color: "var(--series-2)",
    detail: "The Federal, Siasat Daily, Telangana Today, Deccan Chronicle, The News Minute — documented encroachment &amp; litigation stories across 7 districts.",
    url: "https://thefederal.com",
  },
  {
    icon: "🌐",
    name: "ZFI USA / WAMSI mirror",
    stat: "45,191 confirmed",
    color: "var(--series-5)",
    detail: "Third-party mirror of the Government's official WAMSI/UMEED registry — confirms the true national scale, even where per-property detail wasn't scrapable.",
    url: "https://waqf.zfiusa.org",
  },
];

export default function DataSourceCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SOURCES.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-[var(--border-hairline)] bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          style={{ borderTopWidth: 3, borderTopColor: s.color }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
            style={{ backgroundColor: `${s.color}1f` }}
          >
            {s.icon}
          </div>
          <h3 className="mt-3 text-sm font-semibold text-ink">{s.name}</h3>
          <div className="text-xs font-bold mt-0.5" style={{ color: s.color }}>{s.stat}</div>
          <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">{s.detail}</p>
        </a>
      ))}
    </div>
  );
}
