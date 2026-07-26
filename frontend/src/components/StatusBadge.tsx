const STATUS_KEYWORDS: { test: RegExp; color: string; label: string }[] = [
  { test: /encroach/i, color: "var(--status-critical)", label: "Encroached" },
  { test: /litigation|court|dispute/i, color: "var(--status-serious)", label: "In litigation" },
  { test: /registered|clear/i, color: "var(--status-good)", label: "Registered" },
  { test: /unverified/i, color: "var(--status-warning)", label: "Unverified" },
];

export default function StatusBadge({ status }: { status: string | null }) {
  const match = status ? STATUS_KEYWORDS.find((s) => s.test.test(status)) : null;
  const color = match?.color ?? "var(--text-muted)";
  const label = match?.label ?? status ?? "Unknown";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ borderColor: `${color}55`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {label}
    </span>
  );
}
