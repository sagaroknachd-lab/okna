import type { Insight, Subscription } from "./types";
import { MARKET_PLANS } from "./plans";
import { monthlyEquivalent } from "./format";

/** Categories where "rarely / never used" means wasted money (not an essential bill). */
const DISCRETIONARY = new Set([
  "ott",
  "gym",
  "software",
  "membership",
  "mobile",
]);

/** Categories that have a comparison marketplace. */
const COMPARABLE = new Set(["mobile", "broadband", "ott", "software", "gym"]);

function cheapestPlan(category: string) {
  const plans = MARKET_PLANS.filter((p) => p.category === category);
  if (!plans.length) return undefined;
  return plans.reduce((min, p) =>
    monthlyEquivalent(p.amount, p.cycle) < monthlyEquivalent(min.amount, min.cycle)
      ? p
      : min,
  );
}

/**
 * The heart of okna: turn a portfolio of subscriptions into concrete,
 * money-saving actions. Returns insights sorted by estimated ₹/month saved.
 */
export function generateInsights(subs: Subscription[]): Insight[] {
  const insights: Insight[] = [];
  const active = subs.filter((s) => s.status !== "cancelled");

  // 1. Unused / rarely used discretionary subscriptions.
  for (const s of active) {
    if (
      s.status === "active" &&
      DISCRETIONARY.has(s.category) &&
      (s.usage === "rarely" || s.usage === "never")
    ) {
      const save = monthlyEquivalent(s.amount, s.cycle);
      insights.push({
        id: `unused-${s.id}`,
        kind: "unused",
        subscriptionId: s.id,
        title: `You barely use ${s.name}`,
        detail: `Marked as "${s.usage}". Cancelling frees up money you're not getting value from.`,
        monthlySaving: save,
        cta: "Cancel & save",
      });
    }
  }

  // 2. Cheaper plan available in the same category.
  for (const s of active) {
    if (!COMPARABLE.has(s.category)) continue;
    const plan = cheapestPlan(s.category);
    if (!plan) continue;
    const current = monthlyEquivalent(s.amount, s.cycle);
    const alt = monthlyEquivalent(plan.amount, plan.cycle);
    const diff = current - alt;
    if (diff >= 50) {
      insights.push({
        id: `cheaper-${s.id}`,
        kind: "cheaper-plan",
        subscriptionId: s.id,
        planId: plan.id,
        title: `Cheaper option than ${s.name}`,
        detail: `Switch to ${plan.provider} ${plan.name} and get similar value for less.`,
        monthlySaving: diff,
        cta: `Switch to ${plan.provider}`,
      });
    }
  }

  // 3. Duplicate services from the same provider.
  const byProvider = new Map<string, Subscription[]>();
  for (const s of active) {
    const key = s.provider.toLowerCase();
    byProvider.set(key, [...(byProvider.get(key) ?? []), s]);
  }
  for (const [, group] of byProvider) {
    if (group.length < 2) continue;
    // keep the most-expensive one, flag the rest as removable.
    const sorted = [...group].sort(
      (a, b) => monthlyEquivalent(b.amount, b.cycle) - monthlyEquivalent(a.amount, a.cycle),
    );
    for (const dup of sorted.slice(1)) {
      insights.push({
        id: `dup-${dup.id}`,
        kind: "duplicate",
        subscriptionId: dup.id,
        title: `Duplicate ${dup.provider} subscription`,
        detail: `You're paying for ${dup.provider} more than once. Consolidate to a single account.`,
        monthlySaving: monthlyEquivalent(dup.amount, dup.cycle),
        cta: "Remove duplicate",
      });
    }
  }

  // 4. Monthly → annual switch for software/OTT (annual usually ~20% cheaper).
  for (const s of active) {
    if (s.status !== "active") continue;
    if ((s.category === "software" || s.category === "ott") && s.cycle === "monthly") {
      const save = monthlyEquivalent(s.amount, s.cycle) * 0.2;
      if (save >= 30) {
        insights.push({
          id: `annual-${s.id}`,
          kind: "annual-switch",
          subscriptionId: s.id,
          title: `Pay ${s.name} yearly to save`,
          detail: `Annual billing is typically ~20% cheaper than paying monthly.`,
          monthlySaving: save,
          cta: "Switch to annual",
        });
      }
    }
  }

  return insights.sort((a, b) => b.monthlySaving - a.monthlySaving);
}

/** Total addressable monthly saving, counting at most one insight per subscription. */
export function potentialMonthlySaving(insights: Insight[]): number {
  const best = new Map<string, number>();
  for (const i of insights) {
    best.set(i.subscriptionId, Math.max(best.get(i.subscriptionId) ?? 0, i.monthlySaving));
  }
  let total = 0;
  for (const v of best.values()) total += v;
  return total;
}
