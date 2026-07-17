import type { CategoryId, Subscription } from "./types";
import { generateInsights, potentialMonthlySaving } from "./insights";
import { computeStats, lapseRisks } from "./stats";
import { monthlyEquivalent, formatINR } from "./format";
import { category } from "./categories";
import { VENDOR_DIRECTORY, type VendorOption } from "./vendors";
import { tipsForCategories } from "./tips";

/** Categories where "rarely / never used" means wasted money, not an essential bill. */
const DISCRETIONARY = new Set<CategoryId>(["ott", "gym", "software", "membership", "mobile"]);

/**
 * The okna advisor "brain". Everything here is deterministic and runs fully
 * offline: it turns a portfolio into a savings plan, matches overpriced plans
 * to cheaper vendors, gathers relevant tips, and answers free-text questions.
 * The optional live-Claude layer (aiClient.ts) reuses these same helpers to
 * ground its answers.
 */

export interface PlanStep {
  title: string;
  detail: string;
  monthlySaving: number;
}

export interface SavingsPlan {
  monthlyTarget: number;
  yearlyTarget: number;
  steps: PlanStep[];
  lapseWarnings: string[];
}

export function buildSavingsPlan(subs: Subscription[]): SavingsPlan {
  const insights = generateInsights(subs);
  const monthlyTarget = potentialMonthlySaving(insights);

  // One step per subscription (best insight), highest saving first.
  const bestBySub = new Map<string, PlanStep>();
  for (const i of insights) {
    const existing = bestBySub.get(i.subscriptionId);
    if (!existing || i.monthlySaving > existing.monthlySaving) {
      bestBySub.set(i.subscriptionId, {
        title: i.title,
        detail: i.detail,
        monthlySaving: i.monthlySaving,
      });
    }
  }
  const steps = [...bestBySub.values()].sort(
    (a, b) => b.monthlySaving - a.monthlySaving,
  );

  const lapseWarnings = lapseRisks(subs).map(
    (s) => `${s.name} renews soon and isn't on auto-pay — renew it to avoid a lapse or penalty.`,
  );

  return {
    monthlyTarget,
    yearlyTarget: monthlyTarget * 12,
    steps,
    lapseWarnings,
  };
}

export interface VendorMatch {
  subscription: Subscription;
  currentMonthly: number;
  options: (VendorOption & { monthlySaving: number })[];
}

/** For each active subscription, cheaper vendor options in the same category. */
export function vendorAlternatives(subs: Subscription[]): VendorMatch[] {
  const matches: VendorMatch[] = [];
  for (const s of subs) {
    if (s.status !== "active") continue;
    const options = VENDOR_DIRECTORY[s.category];
    if (!options) continue;
    const currentMonthly = monthlyEquivalent(s.amount, s.cycle);
    const cheaper = options
      .map((o) => ({
        ...o,
        monthlySaving: currentMonthly - monthlyEquivalent(o.price, o.cycle),
      }))
      .filter((o) => o.monthlySaving >= 20)
      .sort((a, b) => b.monthlySaving - a.monthlySaving)
      .slice(0, 3);
    if (cheaper.length) {
      matches.push({ subscription: s, currentMonthly, options: cheaper });
    }
  }
  return matches.sort(
    (a, b) => (b.options[0]?.monthlySaving ?? 0) - (a.options[0]?.monthlySaving ?? 0),
  );
}

export function advisorTips(subs: Subscription[]) {
  const categories = [
    ...new Set(subs.filter((s) => s.status === "active").map((s) => s.category)),
  ] as CategoryId[];
  return tipsForCategories(categories);
}

/** A compact, factual snapshot used to ground both the offline and live AI. */
export function portfolioSummary(subs: Subscription[]): string {
  const stats = computeStats(subs);
  const plan = buildSavingsPlan(subs);
  const lines: string[] = [];
  lines.push(
    `Monthly spend ${formatINR(stats.monthlySpend)} (${formatINR(stats.yearlySpend)}/yr) across ${stats.activeCount} active plans.`,
  );
  lines.push(`Identified potential saving: ${formatINR(plan.monthlyTarget)}/mo.`);
  lines.push("Active plans:");
  for (const s of subs.filter((s) => s.status === "active")) {
    lines.push(
      `- ${s.name} (${category(s.category).label}): ${formatINR(s.amount)} per ${s.cycle}, used ${s.usage}, auto-renew ${s.autoRenew ? "on" : "off"}.`,
    );
  }
  return lines.join("\n");
}

// ---- Offline rule-based Q&A responder ------------------------------------

function catMatch(q: string): CategoryId | null {
  const map: [string, CategoryId][] = [
    ["mobile", "mobile"], ["phone", "mobile"], ["recharge", "mobile"], ["sim", "mobile"],
    ["broadband", "broadband"], ["internet", "broadband"], ["wifi", "broadband"], ["fibre", "broadband"], ["fiber", "broadband"],
    ["ott", "ott"], ["netflix", "ott"], ["prime", "ott"], ["hotstar", "ott"], ["stream", "ott"],
    ["insurance", "insurance"], ["policy", "insurance"], ["premium", "insurance"],
    ["credit card", "credit-card"], ["card fee", "credit-card"], ["annual fee", "credit-card"],
    ["loan", "loan-emi"], ["emi", "loan-emi"],
    ["gym", "gym"], ["fitness", "gym"],
    ["software", "software"], ["app subscription", "software"],
    ["membership", "membership"],
  ];
  for (const [kw, cat] of map) if (q.includes(kw)) return cat;
  return null;
}

/**
 * Deterministic answer to a free-text question, grounded in the portfolio.
 * This is the fallback used whenever live AI isn't configured.
 */
export function answerQuestion(subs: Subscription[], question: string): string {
  const q = question.toLowerCase().trim();
  const active = subs.filter((s) => s.status === "active");
  const plan = buildSavingsPlan(subs);

  if (!q) return "Ask me how to cut a specific bill, e.g. \"how do I lower my mobile plan?\"";

  if (/(^|\b)(hi|hello|hey|namaste)\b/.test(q)) {
    return `Hi! I'm your okna savings assistant. Right now I can see ${formatINR(plan.monthlyTarget)}/mo (${formatINR(plan.yearlyTarget)}/yr) you could save. Ask me about any category — mobile, broadband, OTT, insurance, credit cards — or say "what's my biggest saving?"`;
  }

  // Category-specific question → vendor options + tips for that category.
  const cat = catMatch(q);
  if (cat) {
    const matches = vendorAlternatives(active).filter(
      (m) => m.subscription.category === cat,
    );
    const label = category(cat).label;
    const tips = tipsForCategories([cat]).byCategory[0]?.tips ?? [];
    const parts: string[] = [];
    if (matches.length) {
      const m = matches[0];
      const best = m.options[0];
      parts.push(
        `For ${m.subscription.name} (${formatINR(m.currentMonthly)}/mo), a cheaper option is ${best.provider} ${best.plan} — about ${formatINR(best.monthlySaving)}/mo less. ${best.note}`,
      );
    } else {
      parts.push(`I don't see an obvious cheaper ${label} option in your portfolio right now.`);
    }
    if (tips.length) parts.push("Tips: " + tips.join(" "));
    return parts.join("\n\n");
  }

  if (q.includes("biggest") || q.includes("most") || q.includes("top")) {
    if (!plan.steps.length) return "Nothing stands out — your plans look lean and competitively priced.";
    const s = plan.steps[0];
    return `Your biggest single win: ${s.title} — about ${formatINR(s.monthlySaving)}/mo. ${s.detail}`;
  }

  if (q.includes("save") || q.includes("cut") || q.includes("reduce") || q.includes("cheaper")) {
    if (!plan.steps.length) return "You're running lean — no obvious savings right now. 🎉";
    const top = plan.steps.slice(0, 3).map((s) => `• ${s.title} (~${formatINR(s.monthlySaving)}/mo)`).join("\n");
    return `Here's where I'd start — about ${formatINR(plan.monthlyTarget)}/mo in total:\n${top}\n\nOpen the Savings tab to action any of these in a tap.`;
  }

  if (
    q.includes("unused") ||
    q.includes("not using") ||
    q.includes("using") ||
    q.includes("rarely") ||
    q.includes("never") ||
    q.includes("barely") ||
    q.includes("waste")
  ) {
    const unused = active.filter(
      (s) =>
        (s.usage === "rarely" || s.usage === "never") &&
        DISCRETIONARY.has(s.category),
    );
    if (!unused.length) return "Good news — I don't see any discretionary plans you've marked as rarely/never used.";
    return "These look barely used — cancelling frees up money:\n" +
      unused.map((s) => `• ${s.name} (${formatINR(monthlyEquivalent(s.amount, s.cycle))}/mo, ${s.usage})`).join("\n");
  }

  if (q.includes("insurance") || q.includes("lapse") || q.includes("renew")) {
    if (plan.lapseWarnings.length) return plan.lapseWarnings.join("\n");
    return "No insurance/utility renewals are at lapse risk right now. Keep auto-renew off ones set as reminders so you never miss a manual renewal.";
  }

  // Fallback: portfolio-grounded summary.
  return `You're spending about ${formatINR(computeStats(subs).monthlySpend)}/mo across ${active.length} active plans, with roughly ${formatINR(plan.monthlyTarget)}/mo of savings on the table. Ask me about a specific category (mobile, broadband, OTT, insurance, credit card) or say "what's my biggest saving?"`;
}
