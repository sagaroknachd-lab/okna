"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type {
  BillingCycle,
  Subscription,
  UsageFrequency,
} from "@/lib/types";
import type { SubscriptionInput } from "@/lib/store";

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half-yearly", label: "Half-yearly" },
  { value: "yearly", label: "Yearly" },
];

const USAGE: UsageFrequency[] = ["daily", "weekly", "monthly", "rarely", "never"];

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function emptyDraft(): SubscriptionInput {
  return {
    name: "",
    provider: "",
    category: "ott",
    amount: 0,
    cycle: "monthly",
    nextRenewal: todayPlus(30),
    status: "active",
    autoRenew: true,
    usage: "monthly",
    notes: "",
  };
}

export function SubscriptionForm({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: Subscription;
  onSubmit: (input: SubscriptionInput) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SubscriptionInput>(
    initial ?? emptyDraft(),
  );

  function set<K extends keyof SubscriptionInput>(
    key: K,
    val: SubscriptionInput[K],
  ) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || draft.amount <= 0) return;
    onSubmit({ ...draft, name: draft.name.trim(), provider: draft.provider.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">
            {initial ? "Edit subscription" : "Add subscription"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input
                id="name"
                className="input"
                placeholder="Netflix Premium"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="provider">Provider</label>
              <input
                id="provider"
                className="input"
                placeholder="Netflix"
                value={draft.provider}
                onChange={(e) => set("provider", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={draft.category}
              onChange={(e) => set("category", e.target.value as SubscriptionInput["category"])}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                min={0}
                className="input"
                value={draft.amount || ""}
                onChange={(e) => set("amount", Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="label">Billing cycle</label>
              <select
                className="input"
                value={draft.cycle}
                onChange={(e) => set("cycle", e.target.value as BillingCycle)}
              >
                {CYCLES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="renewal">Next renewal</label>
              <input
                id="renewal"
                type="date"
                className="input"
                value={draft.nextRenewal}
                onChange={(e) => set("nextRenewal", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Usage</label>
              <select
                className="input"
                value={draft.usage}
                onChange={(e) => set("usage", e.target.value as UsageFrequency)}
              >
                {USAGE.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-800">Auto-renew</p>
              <p className="text-xs text-ink-500">Charged automatically on renewal</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.autoRenew}
              onClick={() => set("autoRenew", !draft.autoRenew)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                draft.autoRenew ? "bg-brand-500" : "bg-ink-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  draft.autoRenew ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="label" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              className="input min-h-[70px] resize-y"
              placeholder="Anything to remember…"
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {initial ? "Save changes" : "Add subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
