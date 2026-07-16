import type { Subscription } from "./types";

/** Format a Date as yyyy-mm-dd in local time. */
function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Date `days` from now. */
function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return iso(d);
}

/**
 * A realistic starter portfolio for a middle-class Indian household.
 * Renewal dates are generated relative to today so the demo always feels live.
 */
export function defaultSubscriptions(): Subscription[] {
  const createdAt = new Date().toISOString();
  const base: Omit<Subscription, "id" | "createdAt">[] = [
    { name: "Jio ₹399 Unlimited", provider: "Jio", category: "mobile", amount: 399, cycle: "monthly", nextRenewal: inDays(3), status: "active", autoRenew: true, usage: "daily", notes: "Primary SIM" },
    { name: "Airtel ₹359 (2nd SIM)", provider: "Airtel", category: "mobile", amount: 359, cycle: "monthly", nextRenewal: inDays(19), status: "active", autoRenew: true, usage: "rarely", notes: "Barely used second number" },
    { name: "ACT Fibernet 100 Mbps", provider: "ACT", category: "broadband", amount: 799, cycle: "monthly", nextRenewal: inDays(11), status: "active", autoRenew: true, usage: "daily" },
    { name: "Netflix Premium", provider: "Netflix", category: "ott", amount: 649, cycle: "monthly", nextRenewal: inDays(6), status: "active", autoRenew: true, usage: "weekly" },
    { name: "Amazon Prime", provider: "Amazon Prime", category: "ott", amount: 1499, cycle: "yearly", nextRenewal: inDays(58), status: "active", autoRenew: true, usage: "monthly" },
    { name: "JioHotstar Super", provider: "JioHotstar", category: "ott", amount: 899, cycle: "yearly", nextRenewal: inDays(41), status: "active", autoRenew: true, usage: "rarely", notes: "Took it for one cricket season" },
    { name: "Spotify Premium", provider: "Spotify", category: "ott", amount: 119, cycle: "monthly", nextRenewal: inDays(2), status: "active", autoRenew: true, usage: "daily" },
    { name: "Term Life Insurance", provider: "HDFC Life", category: "insurance", amount: 18500, cycle: "yearly", nextRenewal: inDays(24), status: "active", autoRenew: false, usage: "never", notes: "₹1Cr cover — do NOT lapse" },
    { name: "Car Insurance", provider: "ICICI Lombard", category: "insurance", amount: 12400, cycle: "yearly", nextRenewal: inDays(9), status: "active", autoRenew: false, usage: "never", notes: "Renew before expiry to keep NCB" },
    { name: "HDFC Regalia Card Fee", provider: "HDFC Bank", category: "credit-card", amount: 2500, cycle: "yearly", nextRenewal: inDays(72), status: "active", autoRenew: true, usage: "monthly", notes: "Fee waived on ₹4L annual spend" },
    { name: "Home Loan EMI", provider: "SBI", category: "loan-emi", amount: 32000, cycle: "monthly", nextRenewal: inDays(5), status: "active", autoRenew: true, usage: "never" },
    { name: "Electricity (BESCOM)", provider: "BESCOM", category: "electricity", amount: 2200, cycle: "monthly", nextRenewal: inDays(14), status: "active", autoRenew: false, usage: "never" },
    { name: "Piped Gas (GAIL)", provider: "GAIL", category: "gas", amount: 850, cycle: "monthly", nextRenewal: inDays(21), status: "active", autoRenew: false, usage: "never" },
    { name: "School Fees — Term", provider: "DPS", category: "school-fees", amount: 45000, cycle: "quarterly", nextRenewal: inDays(33), status: "active", autoRenew: false, usage: "never" },
    { name: "Cult.fit Membership", provider: "Cult.fit", category: "gym", amount: 2500, cycle: "monthly", nextRenewal: inDays(8), status: "active", autoRenew: true, usage: "rarely", notes: "Went twice last month" },
    { name: "Canva Pro", provider: "Canva", category: "software", amount: 500, cycle: "monthly", nextRenewal: inDays(16), status: "active", autoRenew: true, usage: "monthly" },
    { name: "iCloud+ 200GB", provider: "Apple", category: "software", amount: 219, cycle: "monthly", nextRenewal: inDays(1), status: "active", autoRenew: true, usage: "daily" },
    { name: "Amazon Prime (duplicate)", provider: "Amazon Prime", category: "ott", amount: 299, cycle: "quarterly", nextRenewal: inDays(27), status: "paused", autoRenew: false, usage: "never", notes: "Second Prime account — cancel" },
  ];

  return base.map((b, i) => ({
    ...b,
    id: `seed-${i + 1}`,
    createdAt,
  }));
}
