import type { CategoryId } from "./types";

/**
 * Actionable, India-specific money-saving tips the advisor surfaces. Category
 * tips are shown when the user actually has spend in that category; the general
 * tips always apply.
 */

export const GENERAL_TIPS: string[] = [
  "Move anything you'll keep 6+ months from monthly to annual billing — it's usually 15–20% cheaper.",
  "Cancel or pause any plan you've marked 'rarely' or 'never' used — that's pure leakage.",
  "Turn off auto-renew on discretionary services so you re-decide each cycle instead of paying by default.",
  "Consolidate duplicates: if two services do the same job, keep the one you use and drop the other.",
  "Set every insurance and utility renewal as a 'must not lapse' reminder — a lapse costs far more than the premium.",
];

export const CATEGORY_TIPS: Partial<Record<CategoryId, string[]>> = {
  mobile: [
    "Match the pack validity to how you recharge — 84/90-day packs beat repeated 28-day ones on cost-per-day.",
    "If your plan already bundles OTT, drop the standalone OTT subscription.",
  ],
  broadband: [
    "Ask for the annual-prepay plan — providers often add 1–2 free months.",
    "Right-size your speed: most homes don't need the top tier for streaming and WFH.",
  ],
  ott: [
    "Rotate services — subscribe for the month you binge a show, then pause.",
    "Use a shared family/annual plan instead of multiple individual monthly ones.",
  ],
  insurance: [
    "Prefer pure term + a separate health floater over bundled endowment/ULIP products.",
    "Renew before the due date to protect your no-claim bonus and continuity of cover.",
  ],
  "credit-card": [
    "Hit the spend threshold that waives the annual fee — or move to a lifetime-free card.",
    "Never revolve a balance; the interest dwarfs any reward you earn.",
  ],
  "loan-emi": [
    "On a running loan, ask your lender to reset the rate to their current best — banks rarely do it automatically.",
    "One extra EMI a year meaningfully shortens the tenure and total interest.",
  ],
  software: [
    "Buy annual, and share family plans (Microsoft 365, Google One) instead of individual seats.",
    "For occasional needs, a free/open-source tool often replaces a paid subscription.",
  ],
  gym: [
    "If you go regularly, annual is ~30% cheaper per month; if you don't, cancel and use a free app.",
  ],
  membership: [
    "Check for a free tier — it often covers light usage at zero cost.",
  ],
  electricity: [
    "Shift heavy appliance use off peak hours if you're on a time-of-day tariff.",
  ],
  gas: [
    "Book refills online for cashback/UPI offers rather than paying cash on delivery.",
  ],
};

/** Tips relevant to the categories a user actually spends in, plus general tips. */
export function tipsForCategories(categories: CategoryId[]): {
  general: string[];
  byCategory: { category: CategoryId; tips: string[] }[];
} {
  const seen = new Set(categories);
  const byCategory = [...seen]
    .map((category) => ({ category, tips: CATEGORY_TIPS[category] ?? [] }))
    .filter((c) => c.tips.length > 0);
  return { general: GENERAL_TIPS, byCategory };
}
