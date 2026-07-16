"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { computeStats } from "@/lib/stats";
import { formatINR } from "@/lib/format";
import { SubscriptionList } from "@/components/SubscriptionList";
import { SubscriptionForm } from "@/components/SubscriptionForm";

export default function SubscriptionsPage() {
  const { subscriptions, ready, add, reset } = useStore();
  const [adding, setAdding] = useState(false);
  const stats = computeStats(subscriptions);

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-ink-100" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Subscriptions & bills
          </h1>
          <p className="mt-1 text-ink-500">
            {stats.activeCount} active · {formatINR(stats.monthlySpend)}/month
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost text-xs"
            onClick={() => {
              if (confirm("Reset to the demo portfolio? This clears your changes.")) reset();
            }}
          >
            Reset demo data
          </button>
          <button className="btn-primary" onClick={() => setAdding(true)}>
            ＋ Add
          </button>
        </div>
      </div>

      <SubscriptionList />

      {adding && (
        <SubscriptionForm
          onClose={() => setAdding(false)}
          onSubmit={(input) => {
            add(input);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}
