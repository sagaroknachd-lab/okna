import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: "brand" | "rose" | "amber" | "ink";
  icon?: ReactNode;
}) {
  const accents = {
    brand: "text-brand-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    ink: "text-ink-900",
  } as const;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          {label}
        </span>
        {icon && <span aria-hidden className="text-lg opacity-80">{icon}</span>}
      </div>
      <div className={`mt-2 text-2xl font-bold tracking-tight ${accents[accent ?? "ink"]}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-sm text-ink-500">{sub}</div>}
    </div>
  );
}
