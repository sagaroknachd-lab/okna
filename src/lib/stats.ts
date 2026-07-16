import type { CategoryId, Subscription } from "./types";
import { monthlyEquivalent, yearlyEquivalent, daysUntil } from "./format";

export interface CategoryTotal {
  category: CategoryId;
  monthly: number;
  count: number;
}

export interface PortfolioStats {
  monthlySpend: number;
  yearlySpend: number;
  activeCount: number;
  upcomingCount: number; // renewals within 7 days
  byCategory: CategoryTotal[];
}

export function computeStats(subs: Subscription[]): PortfolioStats {
  const active = subs.filter((s) => s.status === "active");
  let monthlySpend = 0;
  let yearlySpend = 0;
  const cat = new Map<CategoryId, CategoryTotal>();

  for (const s of active) {
    const m = monthlyEquivalent(s.amount, s.cycle);
    monthlySpend += m;
    yearlySpend += yearlyEquivalent(s.amount, s.cycle);
    const entry = cat.get(s.category) ?? { category: s.category, monthly: 0, count: 0 };
    entry.monthly += m;
    entry.count += 1;
    cat.set(s.category, entry);
  }

  const upcomingCount = active.filter((s) => {
    const d = daysUntil(s.nextRenewal);
    return d >= 0 && d <= 7;
  }).length;

  return {
    monthlySpend,
    yearlySpend,
    activeCount: active.length,
    upcomingCount,
    byCategory: [...cat.values()].sort((a, b) => b.monthly - a.monthly),
  };
}

/** Active subscriptions sorted by soonest renewal, within `withinDays`. */
export function upcomingRenewals(subs: Subscription[], withinDays = 45): Subscription[] {
  return subs
    .filter((s) => s.status === "active")
    .map((s) => ({ s, d: daysUntil(s.nextRenewal) }))
    .filter(({ d }) => d <= withinDays)
    .sort((a, b) => a.d - b.d)
    .map(({ s }) => s);
}

/** Insurance / statutory renewals with auto-renew off that must not lapse. */
export function lapseRisks(subs: Subscription[]): Subscription[] {
  return subs.filter(
    (s) =>
      s.status === "active" &&
      !s.autoRenew &&
      (s.category === "insurance" || s.category === "electricity" || s.category === "gas") &&
      daysUntil(s.nextRenewal) <= 15,
  );
}
