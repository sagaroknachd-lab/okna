"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { generateInsights, potentialMonthlySaving } from "@/lib/insights";
import { MARKET_PLANS } from "@/lib/plans";
import {
  formatINR,
  yearlyEquivalent,
  monthlyEquivalent,
} from "@/lib/format";
import type { Insight, InsightKind } from "@/lib/types";

const KIND_META: Record<InsightKind, { icon: string; tint: string; label: string }> = {
  unused: { icon: "🗑️", tint: "bg-rose-50 text-rose-700", label: "Unused" },
  "cheaper-plan": { icon: "🔻", tint: "bg-brand-50 text-brand-700", label: "Cheaper plan" },
  duplicate: { icon: "👯", tint: "bg-violet-50 text-violet-700", label: "Duplicate" },
  "annual-switch": { icon: "📅", tint: "bg-amber-50 text-amber-700", label: "Billing switch" },
  "renewal-soon": { icon: "🔔", tint: "bg-sky-50 text-sky-700", label: "Renewal" },
  "auto-renew-off": { icon: "⚠️", tint: "bg-rose-50 text-rose-700", label: "Risk" },
};

export default function SavingsPage() {
  const { subscriptions, ready, update, remove, setStatus } = useStore();

  const insights = useMemo(() => generateInsights(subscriptions), [subscriptions]);
  const monthlySaving = potentialMonthlySaving(insights);
  const yearlySaving = monthlySaving * 12;

  function apply(i: Insight) {
    switch (i.kind) {
      case "unused":
        if (confirm("Mark as cancelled? It moves out of your active spend.")) {
          setStatus(i.subscriptionId, "cancelled");
        }
        break;
      case "duplicate":
        if (confirm("Remove this duplicate subscription?")) remove(i.subscriptionId);
        break;
      case "cheaper-plan": {
        const plan = MARKET_PLANS.find((p) => p.id === i.planId);
        if (plan && confirm(`Switch to ${plan.provider} ${plan.name} for ${formatINR(plan.amount)}?`)) {
          update(i.subscriptionId, {
            provider: plan.provider,
            name: `${plan.provider} ${plan.name}`,
            amount: plan.amount,
            cycle: plan.cycle,
          });
        }
        break;
      }
      case "annual-switch": {
        const s = subscriptions.find((x) => x.id === i.subscriptionId);
        if (s && confirm("Switch to yearly billing (~20% cheaper)?")) {
          const newYearly = Math.round(yearlyEquivalent(s.amount, s.cycle) * 0.8);
          update(i.subscriptionId, { cycle: "yearly", amount: newYearly });
        }
        break;
      }
    }
  }

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-ink-100" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Savings opportunities
        </h1>
        <p className="mt-1 text-ink-500">
          okna scans your plans for waste, cheaper alternatives and duplicates.
        </p>
      </div>

      {/* Headline savings */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
        <p className="text-sm font-medium text-brand-100">Total identified savings</p>
        <div className="mt-1 flex flex-wrap items-end gap-x-6 gap-y-1">
          <span className="text-4xl font-bold">{formatINR(monthlySaving)}<span className="text-lg font-normal text-brand-200">/mo</span></span>
          <span className="text-brand-100">
            that&apos;s <strong className="text-white">{formatINR(yearlySaving)}</strong> a year back in your pocket
          </span>
        </div>
        <p className="mt-3 text-sm text-brand-100">
          {insights.length} opportunit{insights.length === 1 ? "y" : "ies"} found across your portfolio
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 font-semibold text-ink-900">No waste detected</p>
          <p className="mt-1 text-sm text-ink-500">
            Every plan looks used and competitively priced. We&apos;ll keep watching.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {insights.map((i) => {
            const meta = KIND_META[i.kind];
            const sub = subscriptions.find((s) => s.id === i.subscriptionId);
            return (
              <li key={i.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${meta.tint}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{i.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.tint}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">{i.detail}</p>
                    {sub && (
                      <p className="mt-1.5 text-xs text-ink-400">
                        Currently {formatINR(monthlyEquivalent(sub.amount, sub.cycle))}/mo
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700">
                      +{formatINR(i.monthlySaving)}/mo
                    </span>
                    <button
                      className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800"
                      onClick={() => apply(i)}
                    >
                      {i.cta}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
