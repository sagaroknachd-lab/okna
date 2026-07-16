"use client";

import { category } from "@/lib/categories";
import { formatINR } from "@/lib/format";
import type { CategoryTotal } from "@/lib/stats";

/** Dependency-free SVG donut chart of monthly spend by category. */
export function CategoryDonut({
  data,
  total,
}: {
  data: CategoryTotal[];
  total: number;
}) {
  const size = 180;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = data
    .filter((d) => d.monthly > 0)
    .map((d) => {
      const frac = total > 0 ? d.monthly / total : 0;
      const seg = {
        ...d,
        frac,
        dash: frac * circumference,
        gap: circumference - frac * circumference,
        rotation: (offset / (total || 1)) * 360,
      };
      offset += d.monthly;
      return seg;
    });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#eceef2" strokeWidth={stroke} />
          {segments.map((s) => (
            <circle
              key={s.category}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={category(s.category).color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-((s.rotation / 360) * circumference)}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            Monthly
          </span>
          <span className="text-xl font-bold text-ink-900">{formatINR(total)}</span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {segments.map((s) => {
          const c = category(s.category);
          return (
            <li key={s.category} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: c.color }}
              />
              <span className="text-ink-700">{c.label}</span>
              <span className="ml-auto font-semibold text-ink-900">
                {formatINR(s.monthly)}
              </span>
              <span className="w-10 text-right text-xs text-ink-400">
                {Math.round(s.frac * 100)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
