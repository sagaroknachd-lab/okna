"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeStats, upcomingRenewals, lapseRisks } from "@/lib/stats";
import { generateInsights, potentialMonthlySaving } from "@/lib/insights";
import {
  formatINR,
  formatINRCompact,
  relativeDay,
  daysUntil,
  CYCLE_LABEL,
} from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { CategoryDonut } from "@/components/CategoryDonut";
import { CategoryChip } from "@/components/ui/Chip";

export default function OverviewPage() {
  const { subscriptions, ready } = useStore();

  const { stats, renewals, risks, insights, saving } = useMemo(() => {
    const stats = computeStats(subscriptions);
    const insights = generateInsights(subscriptions);
    return {
      stats,
      renewals: upcomingRenewals(subscriptions, 30).slice(0, 5),
      risks: lapseRisks(subscriptions),
      insights: insights.slice(0, 3),
      saving: potentialMonthlySaving(generateInsights(subscriptions)),
    };
  }, [subscriptions]);

  if (!ready) return <Skeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Your money, at a glance
        </h1>
        <p className="mt-1 text-ink-500">
          Everything you pay for on repeat — tracked, compared and never forgotten.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Monthly spend"
          value={formatINR(stats.monthlySpend)}
          sub={`${formatINRCompact(stats.yearlySpend)} / year`}
          icon="💸"
        />
        <StatCard
          label="Active plans"
          value={stats.activeCount}
          sub={`across ${stats.byCategory.length} categories`}
          icon="🗂️"
        />
        <StatCard
          label="Due in 7 days"
          value={stats.upcomingCount}
          sub="renewals coming up"
          accent={stats.upcomingCount > 0 ? "amber" : "ink"}
          icon="🔔"
        />
        <StatCard
          label="You could save"
          value={formatINR(saving)}
          sub="per month with okna"
          accent="brand"
          icon="💡"
        />
      </div>

      {risks.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="font-semibold text-rose-800">
            ⚠️ {risks.length} renewal{risks.length > 1 ? "s" : ""} need your action
          </p>
          <p className="mt-1 text-sm text-rose-700">
            These aren&apos;t on auto-pay — missing them means a lapse or late fee.{" "}
            <Link href="/app/reminders" className="font-semibold underline">
              Review reminders
            </Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Spend breakdown */}
        <section className="card p-5 lg:col-span-3">
          <h2 className="mb-4 font-semibold text-ink-900">Where your money goes</h2>
          <CategoryDonut data={stats.byCategory} total={stats.monthlySpend} />
        </section>

        {/* Top savings */}
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Top ways to save</h2>
            <Link href="/app/savings" className="text-sm font-semibold text-brand-600">
              See all
            </Link>
          </div>
          {insights.length === 0 ? (
            <p className="text-sm text-ink-500">
              You&apos;re running a tight ship — no obvious savings right now. 🎉
            </p>
          ) : (
            <ul className="space-y-3">
              {insights.map((i) => (
                <li key={i.id} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink-800">{i.title}</p>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                      +{formatINR(i.monthlySaving)}/mo
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Upcoming renewals */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Coming up</h2>
          <Link href="/app/reminders" className="text-sm font-semibold text-brand-600">
            All reminders
          </Link>
        </div>
        {renewals.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing due in the next 30 days.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {renewals.map((s) => {
              const d = daysUntil(s.nextRenewal);
              const soon = d <= 7;
              return (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-center ${
                      soon ? "bg-rose-50 text-rose-700" : "bg-ink-50 text-ink-600"
                    }`}
                  >
                    <span className="text-sm font-bold leading-none">{Math.max(d, 0)}</span>
                    <span className="text-[9px] uppercase">days</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-900">{s.name}</p>
                    <div className="mt-0.5">
                      <CategoryChip id={s.category} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink-900">
                      {formatINR(s.amount)}
                      <span className="text-xs font-normal text-ink-400">
                        {CYCLE_LABEL[s.cycle]}
                      </span>
                    </p>
                    <p className={`text-xs ${soon ? "text-rose-600" : "text-ink-400"}`}>
                      {relativeDay(s.nextRenewal)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink-100" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-ink-100" />
    </div>
  );
}
