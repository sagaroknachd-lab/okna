import { category } from "@/lib/categories";
import type { CategoryId, SubStatus, UsageFrequency } from "@/lib/types";

export function CategoryChip({ id }: { id: CategoryId }) {
  const c = category(id);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.tint}`}
    >
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  );
}

const STATUS_STYLES: Record<SubStatus, string> = {
  active: "bg-brand-50 text-brand-700",
  paused: "bg-amber-50 text-amber-700",
  cancelled: "bg-ink-100 text-ink-500",
};

export function StatusBadge({ status }: { status: SubStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

const USAGE_STYLES: Record<UsageFrequency, string> = {
  daily: "text-brand-700",
  weekly: "text-brand-600",
  monthly: "text-ink-500",
  rarely: "text-amber-600",
  never: "text-rose-600",
};

export function UsageDot({ usage }: { usage: UsageFrequency }) {
  return (
    <span className={`text-xs font-medium ${USAGE_STYLES[usage]}`}>
      Used {usage}
    </span>
  );
}
