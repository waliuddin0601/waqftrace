export default function StatTile({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</div>
      <div
        className="mt-1 text-2xl font-semibold tabular-nums"
        style={{ color: accent ?? "var(--text-primary)" }}
      >
        {value}
      </div>
      {sublabel && <div className="mt-0.5 text-xs text-ink-secondary">{sublabel}</div>}
    </div>
  );
}
