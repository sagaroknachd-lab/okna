"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { upcomingRenewals, lapseRisks } from "@/lib/stats";
import {
  formatINR,
  formatDate,
  relativeDay,
  daysUntil,
  CYCLES_PER_YEAR,
} from "@/lib/format";
import { CategoryChip } from "@/components/ui/Chip";
import type { BillingCycle, Subscription } from "@/lib/types";

/** Advance an ISO date by one billing cycle. */
function nextCycleDate(iso: string, cycle: BillingCycle): string {
  const d = new Date(iso + "T00:00:00");
  const monthsToAdd = 12 / CYCLES_PER_YEAR[cycle];
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toISOString().slice(0, 10);
}

export default function RemindersPage() {
  const { subscriptions, ready, update } = useStore();

  const { risks, buckets } = useMemo(() => {
    const upcoming = upcomingRenewals(subscriptions, 60);
    const buckets = {
      overdue: upcoming.filter((s) => daysUntil(s.nextRenewal) < 0),
      week: upcoming.filter((s) => {
        const d = daysUntil(s.nextRenewal);
        return d >= 0 && d <= 7;
      }),
      month: upcoming.filter((s) => {
        const d = daysUntil(s.nextRenewal);
        return d > 7 && d <= 30;
      }),
      later: upcoming.filter((s) => daysUntil(s.nextRenewal) > 30),
    };
    return { risks: lapseRisks(subscriptions), buckets };
  }, [subscriptions]);

  function markPaid(s: Subscription) {
    update(s.id, { nextRenewal: nextCycleDate(s.nextRenewal, s.cycle) });
  }

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-ink-100" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Reminders</h1>
        <p className="mt-1 text-ink-500">
          Never miss a renewal, insurance date or bill again.
        </p>
      </div>

      {risks.length > 0 && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <h2 className="font-semibold text-rose-800">⚠️ Must not lapse</h2>
          <p className="mt-1 text-sm text-rose-700">
            Manual renewals due soon — a miss means a penalty, lost cover or lost no-claim bonus.
          </p>
          <ul className="mt-3 space-y-2">
            {risks.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{s.name}</p>
                  <p className="text-xs text-rose-600">
                    Due {relativeDay(s.nextRenewal)} · {formatDate(s.nextRenewal)}
                  </p>
                </div>
                <span className="font-semibold text-ink-900">{formatINR(s.amount)}</span>
                <button
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  onClick={() => markPaid(s)}
                >
                  Mark paid
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Bucket title="Overdue" tone="rose" items={buckets.overdue} onPaid={markPaid} onToggle={update} />
      <Bucket title="This week" tone="amber" items={buckets.week} onPaid={markPaid} onToggle={update} />
      <Bucket title="This month" tone="ink" items={buckets.month} onPaid={markPaid} onToggle={update} />
      <Bucket title="Later" tone="ink" items={buckets.later} onPaid={markPaid} onToggle={update} />

      {buckets.overdue.length +
        buckets.week.length +
        buckets.month.length +
        buckets.later.length ===
        0 && (
        <div className="card p-10 text-center text-ink-500">
          Nothing due in the next 60 days. You&apos;re all caught up. ✅
        </div>
      )}
    </div>
  );
}

function Bucket({
  title,
  tone,
  items,
  onPaid,
  onToggle,
}: {
  title: string;
  tone: "rose" | "amber" | "ink";
  items: Subscription[];
  onPaid: (s: Subscription) => void;
  onToggle: (id: string, patch: Partial<Subscription>) => void;
}) {
  if (items.length === 0) return null;
  const dot = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    ink: "bg-ink-300",
  }[tone];

  return (
    <section className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink-900">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {title}
        <span className="text-sm font-normal text-ink-400">({items.length})</span>
      </h2>
      <ul className="divide-y divide-ink-100">
        {items.map((s) => {
          const d = daysUntil(s.nextRenewal);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">{s.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <CategoryChip id={s.category} />
                  <span className={`text-xs ${d < 0 ? "text-rose-600" : "text-ink-400"}`}>
                    {relativeDay(s.nextRenewal)} · {formatDate(s.nextRenewal)}
                  </span>
                </div>
              </div>
              <span className="font-semibold text-ink-900">{formatINR(s.amount)}</span>
              <label className="flex items-center gap-1.5 text-xs text-ink-500">
                <input
                  type="checkbox"
                  checked={s.autoRenew}
                  onChange={(e) => onToggle(s.id, { autoRenew: e.target.checked })}
                  className="h-4 w-4 accent-brand-600"
                />
                Auto
              </label>
              <button
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
                onClick={() => onPaid(s)}
              >
                Mark paid
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
