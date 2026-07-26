import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Property } from "../lib/types";
import { categoryMeta } from "./CategoryBadge";

export default function CategoryBreakdownChart({ properties }: { properties: Property[] }) {
  const counts = new Map<string, number>();
  for (const p of properties) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const data = Array.from(counts.entries())
    .map(([category, count]) => ({ category, count, ...categoryMeta(category) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Properties by category</h3>
      <p className="text-xs text-ink-muted mb-3">{properties.length.toLocaleString()} tracked properties, this dataset</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis
            type="number"
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={100}
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--gridline)" }}
            contentStyle={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {data.map((d) => (
              <Cell key={d.category} fill={d.color} />
            ))}
            <LabelList dataKey="count" position="right" fill="var(--text-secondary)" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
