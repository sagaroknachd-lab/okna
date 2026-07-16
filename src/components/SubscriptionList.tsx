"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { CategoryId, Subscription } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import {
  formatINR,
  formatDate,
  relativeDay,
  daysUntil,
  CYCLE_LABEL,
  monthlyEquivalent,
} from "@/lib/format";
import { CategoryChip, StatusBadge, UsageDot } from "@/components/ui/Chip";
import { SubscriptionForm } from "@/components/SubscriptionForm";

type SortKey = "renewal" | "amount" | "name";

export function SubscriptionList() {
  const { subscriptions, update, remove, setStatus } = useStore();
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortKey>("renewal");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    let list = subscriptions.filter((s) => s.status !== "cancelled");
    if (filter !== "all") list = list.filter((s) => s.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "amount")
        return monthlyEquivalent(b.amount, b.cycle) - monthlyEquivalent(a.amount, a.cycle);
      if (sort === "name") return a.name.localeCompare(b.name);
      return daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal);
    });
  }, [subscriptions, filter, sort, query]);

  const usedCategories = useMemo(
    () => new Set(subscriptions.map((s) => s.category)),
    [subscriptions],
  );

  return (
    <div>
      {/* controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input sm:max-w-xs"
          placeholder="Search subscriptions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-1 items-center gap-3">
          <select
            className="input max-w-[180px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value as CategoryId | "all")}
          >
            <option value="all">All categories</option>
            {CATEGORIES.filter((c) => usedCategories.has(c.id)).map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <select
            className="input max-w-[170px]"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="renewal">Sort: Next renewal</option>
            <option value="amount">Sort: Cost</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      <ul className="space-y-2.5">
        {rows.map((s) => {
          const d = daysUntil(s.nextRenewal);
          const soon = d >= 0 && d <= 7;
          return (
            <li key={s.id} className="card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink-900">{s.name}</h3>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                    <CategoryChip id={s.category} />
                    <UsageDot usage={s.usage} />
                    {!s.autoRenew && (
                      <span className="text-xs font-medium text-amber-600">Manual renewal</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-ink-900">
                    {formatINR(s.amount)}
                    <span className="text-xs font-normal text-ink-400">
                      {CYCLE_LABEL[s.cycle]}
                    </span>
                  </p>
                  <p className={`text-xs font-medium ${soon ? "text-rose-600" : "text-ink-500"}`}>
                    Renews {relativeDay(s.nextRenewal)} · {formatDate(s.nextRenewal)}
                  </p>
                </div>
              </div>

              {s.notes && (
                <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
                  {s.notes}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                <button
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                  onClick={() => setEditing(s)}
                >
                  Edit
                </button>
                {s.status === "active" ? (
                  <button
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                    onClick={() => setStatus(s.id, "paused")}
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                    onClick={() => setStatus(s.id, "active")}
                  >
                    Resume
                  </button>
                )}
                <button
                  className="ml-auto rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  onClick={() => remove(s.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && (
        <div className="card p-10 text-center text-ink-500">
          No subscriptions match your filters yet.
        </div>
      )}

      {editing && (
        <SubscriptionForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(input) => {
            update(editing.id, input);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
