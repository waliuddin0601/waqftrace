import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import BuilderCard from "./BuilderCard";

const NAV = [
  { to: "/", label: "Dashboard", icon: "🗺️", end: true },
  { to: "/report", label: "Report", icon: "🚨" },
  { to: "/marketplace", label: "Marketplace", icon: "🏗️" },
  { to: "/donate", label: "Donate", icon: "🤲" },
  { to: "/legal", label: "Legal", icon: "⚖️" },
  { to: "/register", label: "Register", icon: "📋" },
  { to: "/chat", label: "Ask WaqfTrace", icon: "💬" },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border-hairline)] bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-series1 to-series7 text-lg" aria-hidden>🕌</span>
            <div>
              <div className="text-lg font-bold leading-tight bg-gradient-to-r from-series1 to-series7 bg-clip-text text-transparent">WaqfTrace</div>
              <div className="text-[11px] text-ink-muted leading-tight">Hyderabad, Telangana</div>
            </div>
          </NavLink>

          <nav className="hidden lg:flex flex-wrap gap-1 text-sm">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
                    isActive
                      ? "bg-series1 text-white shadow-sm"
                      : "text-ink-secondary hover:bg-page hover:text-ink"
                  }`
                }
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
                  isActive ? "bg-series1 text-white" : "text-ink-muted hover:bg-page hover:text-ink"
                }`
              }
            >
              About
            </NavLink>
          </nav>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden rounded-md border border-[var(--border-hairline)] px-3 py-1.5 text-sm"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <nav className="lg:hidden border-t border-[var(--border-hairline)] bg-surface px-4 py-2 grid grid-cols-2 gap-1">
            {[...NAV, { to: "/about", label: "About", icon: "ℹ️" }].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-series1/10 text-series1" : "text-ink-secondary hover:bg-page"
                  }`
                }
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--border-hairline)] bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4">
          <p className="text-xs text-ink-muted max-w-md">
            Built for Algorism · Every figure is sourced from the official Telangana State
            Waqf Board, court records, or OpenStreetMap. Gaps are labeled, not hidden — see{" "}
            <NavLink to="/about" className="text-series1 hover:underline">About</NavLink> for data
            provenance and known limitations.
          </p>
          <BuilderCard />
        </div>
      </footer>
    </div>
  );
}
