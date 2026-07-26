// TODO: replace with the real LinkedIn URL before deploying.
const LINKEDIN_URL = "https://www.linkedin.com/in/REPLACE-ME";

export default function BuilderCard() {
  return (
    <a
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-[var(--border-hairline)] bg-surface px-3 py-2 text-sm shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-series1/10 text-series1 font-semibold">
        MW
      </div>
      <div className="leading-tight">
        <div className="font-medium text-ink">Mohammed Waliuddin Hussain</div>
        <div className="text-ink-muted text-xs">Data &amp; AI Engineer · NIT Warangal</div>
      </div>
    </a>
  );
}
