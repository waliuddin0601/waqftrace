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
  "Show me mosques in Hyderabad",
  "Which dargahs are under litigation?",
  "List graveyards in Rangareddy",
  "Properties with commercial scope",
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
      <div>
        <h1 className="text-2xl font-semibold">Ask WaqfTrace</h1>
        <p className="text-sm text-ink-secondary mt-2">
          Ask in plain English. Claude extracts a structured filter (category / district / status) and
          runs it through a parameterized query — never raw SQL — against our tracked properties.
        </p>
      </div>

      {turns.length === 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => ask(ex)}
              className="rounded-full border border-[var(--border-hairline)] bg-surface px-3 py-1.5 text-xs text-ink-secondary hover:bg-page"
            >
              {ex}
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
