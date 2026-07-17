import type { CategoryId } from "./types";

/**
 * A curated, illustrative directory of alternative vendors / plans the advisor
 * can suggest when someone is overpaying in a category. Prices are indicative
 * ₹ amounts for a typical Indian household and are for demonstration only — the
 * advisor always frames them as "typically around" rather than a live quote.
 */
export interface VendorOption {
  provider: string;
  plan: string;
  /** indicative price in rupees for `cycle` */
  price: number;
  cycle: "monthly" | "quarterly" | "half-yearly" | "yearly";
  /** why this is worth a look — the saving lever */
  note: string;
}

export const VENDOR_DIRECTORY: Partial<Record<CategoryId, VendorOption[]>> = {
  mobile: [
    { provider: "Jio", plan: "₹749 / 90-day", price: 749, cycle: "quarterly", note: "Long-validity packs cut the effective monthly rate vs 28-day recharges." },
    { provider: "Airtel", plan: "₹359 / 28-day", price: 359, cycle: "monthly", note: "Mid-tier data with free OTT bundled — drop a separate OTT plan." },
    { provider: "Vi", plan: "₹475 / 56-day", price: 475, cycle: "monthly", note: "Two-month packs for light users; weekend data rollover." },
    { provider: "BSNL", plan: "₹397 / 150-day", price: 397, cycle: "half-yearly", note: "Cheapest per-day cost if coverage is fine where you live." },
  ],
  broadband: [
    { provider: "Jio AirFiber", plan: "30 Mbps", price: 599, cycle: "monthly", note: "Entry fibre/AirFiber tier — enough for 2–3 streams + WFH." },
    { provider: "Airtel Xstream", plan: "40 Mbps + OTT", price: 699, cycle: "monthly", note: "Bundles OTT you may already be paying for separately." },
    { provider: "BSNL Fibre", plan: "60 Mbps", price: 499, cycle: "monthly", note: "Lowest sticker price where BSNL fibre is available." },
    { provider: "ACT", plan: "Annual prepay", price: 6999, cycle: "yearly", note: "Annual prepay usually adds 1–2 free months vs monthly billing." },
  ],
  ott: [
    { provider: "Netflix", plan: "Mobile", price: 149, cycle: "monthly", note: "Single-screen mobile plan if you mostly watch on your phone." },
    { provider: "Amazon Prime", plan: "Annual", price: 1499, cycle: "yearly", note: "Annual works out to ~₹125/mo and adds shopping + music." },
    { provider: "Hotstar", plan: "Super (annual)", price: 899, cycle: "yearly", note: "Annual is far cheaper per month than the monthly tier." },
    { provider: "Telco bundle", plan: "OTT via recharge", price: 0, cycle: "monthly", note: "Many mobile/broadband plans include OTT free — cancel the duplicate." },
  ],
  software: [
    { provider: "Google One", plan: "100 GB annual", price: 1300, cycle: "yearly", note: "Annual storage plans beat monthly; share across family." },
    { provider: "Microsoft 365", plan: "Family (annual)", price: 4199, cycle: "yearly", note: "Up to 6 users — split the cost instead of individual plans." },
    { provider: "Open-source", plan: "Free alternative", price: 0, cycle: "monthly", note: "For occasional use, a free tool may replace a paid subscription." },
  ],
  gym: [
    { provider: "Local gym", plan: "Annual membership", price: 12000, cycle: "yearly", note: "Annual is ~30% cheaper per month than pay-as-you-go." },
    { provider: "cult.fit", plan: "Elite (quarterly)", price: 4500, cycle: "quarterly", note: "Quarterly packs lower the monthly rate if you actually go." },
    { provider: "Home + app", plan: "Free/low-cost app", price: 0, cycle: "monthly", note: "If usage is 'rarely', a free app beats an unused membership." },
  ],
  insurance: [
    { provider: "Term (online)", plan: "Pure term cover", price: 12000, cycle: "yearly", note: "Online term plans are cheaper than agent-sold endowment/ULIP." },
    { provider: "Family floater", plan: "Health floater", price: 18000, cycle: "yearly", note: "One floater for the family is usually cheaper than separate policies." },
  ],
  "credit-card": [
    { provider: "No-fee card", plan: "Lifetime-free", price: 0, cycle: "yearly", note: "Switch to a lifetime-free card and stop paying the annual fee entirely." },
  ],
  membership: [
    { provider: "Free tier", plan: "Downgrade", price: 0, cycle: "monthly", note: "Many memberships have a free tier that covers light usage." },
  ],
};

/** Categories where showing vendor alternatives makes sense. */
export function hasVendorOptions(category: CategoryId): boolean {
  return (VENDOR_DIRECTORY[category]?.length ?? 0) > 0;
}
