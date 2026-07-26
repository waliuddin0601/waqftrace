import type { Category } from "../lib/types";

const CATEGORY_META: Record<Category, { label: string; color: string; icon: string }> = {
  mosque: { label: "Mosque", color: "var(--series-1)", icon: "🕌" },
  dargah: { label: "Dargah", color: "var(--series-7)", icon: "🕋" },
  graveyard: { label: "Graveyard", color: "var(--series-4)", icon: "⚰️" },
  ashoorkhana: { label: "Ashoorkhana", color: "var(--series-5)", icon: "🏛️" },
  chillah: { label: "Chillah", color: "var(--series-3)", icon: "🛖" },
  land: { label: "Vacant land", color: "var(--series-2)", icon: "🌾" },
  other: { label: "Other", color: "var(--text-muted)", icon: "📍" },
};

export function categoryMeta(category: string) {
  return CATEGORY_META[(category as Category) in CATEGORY_META ? (category as Category) : "other"];
}

export default function CategoryBadge({ category }: { category: string }) {
  const meta = categoryMeta(category);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
