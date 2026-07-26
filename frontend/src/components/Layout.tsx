import { NavLink, Outlet } from "react-router-dom";
import BuilderCard from "./BuilderCard";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/report", label: "Report an issue" },
  { to: "/transparency", label: "Transparency" },
  { to: "/legal", label: "Legal tracker" },
  { to: "/yield-optimizer", label: "Yield optimizer" },
  { to: "/about", label: "About" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border-hairline)] bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>🕌</span>
            <div>
              <div className="text-lg font-semibold leading-tight">WaqfTrace</div>
              <div className="text-xs text-ink-muted leading-tight">Hyderabad, Telangana</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 font-medium transition ${
                    isActive
                      ? "bg-series1/10 text-series1"
                      : "text-ink-secondary hover:bg-page hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--border-hairline)] bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <p className="text-xs text-ink-muted max-w-md">
            Built for Algorism · Every figure is sourced from the official Telangana State
            Waqf Board, court records, or OpenStreetMap. Gaps are labeled, not hidden — see the
            About page for data provenance and known limitations.
          </p>
          <BuilderCard />
        </div>
      </footer>
    </div>
  );
}
