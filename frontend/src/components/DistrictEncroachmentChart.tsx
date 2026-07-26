import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DistrictStat } from "../lib/types";

export default function DistrictEncroachmentChart({ stats }: { stats: DistrictStat[] }) {
  const data = stats
    .filter((d) => d.area_acres_total && d.area_encroached_acres != null)
    .map((d) => ({
      district: d.district,
      pct: Math.round(((d.area_encroached_acres ?? 0) / (d.area_acres_total ?? 1)) * 1000) / 10,
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Encroachment by district</h3>
      <p className="text-xs text-ink-muted mb-3">Share of official Waqf land area currently encroached</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="district"
            width={110}
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
            formatter={(v: number) => [`${v}%`, "Encroached"]}
          />
          <Bar dataKey="pct" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={16}>
            <LabelList dataKey="pct" position="right" formatter={(v: number) => `${v}%`} fill="var(--text-secondary)" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
