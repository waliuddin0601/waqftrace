import { useState } from "react";
import { Link } from "react-router-dom";
import { callFunction } from "../lib/supabase";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";

type ResultProperty = {
  id: string;
  name: string;
  category: string;
  district: string | null;
  locality_ward: string | null;
  status: string | null;
  caretaker_mutawalli: string | null;
};

type QueryResponse = {
  answer_text: string;
  count: number | null;
  properties: ResultProperty[];
};

type Turn = { question: string; response?: QueryResponse; error?: string };

const EXAMPLES = [
  { icon: "🕌", text: "Show me mosques in Hyderabad" },
  { icon: "🕋", text: "Which dargahs are under litigation?" },
  { icon: "⚰️", text: "List graveyards in Rangareddy" },
  { icon: "🏗️", text: "Properties with commercial scope" },
];

export default function Chat() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setLoading(true);
    setInput("");
    setTurns((t) => [...t, { question }]);
    try {
      const response = await callFunction<QueryResponse>("nl-query", { question });
      setTurns((t) => t.map((turn, i) => (i === t.length - 1 ? { ...turn, response } : turn)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not reach the query service.";
      setTurns((t) => t.map((turn, i) => (i === t.length - 1 ? { ...turn, error: message } : turn)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
      <div className="rounded-2xl bg-gradient-to-br from-series7 to-series1 px-6 py-8 text-white shadow-lg">
        <div className="text-3xl" aria-hidden>🔍</div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">Search for your desired land</h1>
        <p className="text-sm sm:text-base text-white/90 mt-2 max-w-xl">
          Describe what you're looking for in plain English — no filters, no forms. Claude pulls the
          exact matching properties for you, straight from the live database.
        </p>
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Powered by a safe text-to-filter pipeline (not raw text-to-SQL) — see{" "}
        <Link to="/about" className="text-series1 hover:underline">About</Link> for how.
      </p>

      {turns.length === 0 && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.text}
              onClick={() => ask(ex.text)}
              className="flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-surface p-3 text-left text-sm text-ink-secondary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:text-ink"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-series1/10 text-lg">
                {ex.icon}
              </span>
              {ex.text}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 mt-6 space-y-4 overflow-y-auto">
        {turns.map((turn, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-series1 px-4 py-2 text-sm text-white w-fit">
              {turn.question}
            </div>
            {turn.error && (
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-critical/10 px-4 py-2 text-sm text-critical w-fit">
                {turn.error}
              </div>
            )}
            {turn.response && (
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-surface border border-[var(--border-hairline)] px-4 py-3 text-sm">
                <p className="text-ink">{turn.response.answer_text}</p>
                {turn.response.properties?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {turn.response.properties.map((p) => (
                      <Link
                        key={p.id}
                        to={`/property/${p.id}`}
                        className="flex items-center justify-between gap-2 rounded-md bg-page px-3 py-2 hover:shadow-sm"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <CategoryBadge category={p.category} />
                          <span className="truncate text-xs">{p.name}</span>
                        </span>
                        <StatusBadge status={p.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-xs text-ink-muted">Thinking…</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-4 flex gap-2 sticky bottom-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. show me waqf lands in Hyderabad under mosque category"
          className="flex-1 rounded-full border border-[var(--border-hairline)] bg-surface px-4 py-2.5 text-sm shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-series1 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
