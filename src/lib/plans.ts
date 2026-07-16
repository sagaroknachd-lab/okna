import type { MarketPlan } from "./types";

/**
 * A small curated marketplace of representative Indian plans used by the
 * savings engine to suggest cheaper alternatives. Prices are illustrative.
 */
export const MARKET_PLANS: MarketPlan[] = [
  // ---- Mobile ----
  {
    id: "mob-jio-349",
    category: "mobile",
    provider: "Jio",
    name: "₹349 Unlimited (28 days)",
    amount: 349,
    cycle: "monthly",
    features: ["2GB/day", "Unlimited calls", "JioHotstar included"],
    highlight: "Best value with OTT",
  },
  {
    id: "mob-airtel-299",
    category: "mobile",
    provider: "Airtel",
    name: "₹299 Smart (28 days)",
    amount: 299,
    cycle: "monthly",
    features: ["1.5GB/day", "Unlimited calls", "Wynk Music"],
    highlight: "Lowest unlimited",
  },
  {
    id: "mob-vi-319",
    category: "mobile",
    provider: "Vi",
    name: "₹319 Hero (28 days)",
    amount: 319,
    cycle: "monthly",
    features: ["2GB/day", "Weekend data rollover", "Unlimited calls"],
  },

  // ---- Broadband ----
  {
    id: "bb-jiofiber-399",
    category: "broadband",
    provider: "JioFiber",
    name: "30 Mbps Broadband",
    amount: 399,
    cycle: "monthly",
    features: ["30 Mbps", "Unlimited data", "14 OTT apps"],
    highlight: "Cheapest fibre",
  },
  {
    id: "bb-airtel-499",
    category: "broadband",
    provider: "Airtel Xstream",
    name: "40 Mbps Entertainment",
    amount: 499,
    cycle: "monthly",
    features: ["40 Mbps", "Unlimited data", "Xstream + Wynk"],
  },
  {
    id: "bb-bsnl-329",
    category: "broadband",
    provider: "BSNL",
    name: "Fibre Basic 30 Mbps",
    amount: 329,
    cycle: "monthly",
    features: ["30 Mbps", "Unlimited data"],
    highlight: "Budget pick",
  },

  // ---- OTT ----
  {
    id: "ott-jiohotstar-499",
    category: "ott",
    provider: "JioHotstar",
    name: "Super (yearly)",
    amount: 499,
    cycle: "yearly",
    features: ["Sports + shows", "2 screens", "1080p"],
    highlight: "Cheapest streaming",
  },
  {
    id: "ott-netflix-149",
    category: "ott",
    provider: "Netflix",
    name: "Mobile Plan",
    amount: 149,
    cycle: "monthly",
    features: ["1 mobile screen", "480p"],
    highlight: "If you mostly watch on phone",
  },
  {
    id: "ott-prime-299",
    category: "ott",
    provider: "Amazon Prime",
    name: "Prime Quarterly",
    amount: 299,
    cycle: "quarterly",
    features: ["Video + Music", "Free delivery", "4K"],
  },

  // ---- Software ----
  {
    id: "sw-canva-3999",
    category: "software",
    provider: "Canva",
    name: "Pro (annual)",
    amount: 3999,
    cycle: "yearly",
    features: ["Save ₹1500 vs monthly", "Premium assets"],
    highlight: "Annual saves ~30%",
  },

  // ---- Gym ----
  {
    id: "gym-cult-quarterly",
    category: "gym",
    provider: "Cult.fit",
    name: "Elite Quarterly",
    amount: 6000,
    cycle: "quarterly",
    features: ["All centres", "Group classes"],
    highlight: "Cheaper per-month than monthly",
  },
];

export function plansForCategory(category: string): MarketPlan[] {
  return MARKET_PLANS.filter((p) => p.category === category);
}
