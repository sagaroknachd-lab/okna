import type { BillingCycle } from "./types";

/** Number of billing cycles in a year. */
export const CYCLES_PER_YEAR: Record<BillingCycle, number> = {
  monthly: 12,
  quarterly: 4,
  "half-yearly": 2,
  yearly: 1,
};

export const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "/month",
  quarterly: "/quarter",
  "half-yearly": "/6 months",
  yearly: "/year",
};

/** Normalise a per-cycle amount to its monthly equivalent. */
export function monthlyEquivalent(amount: number, cycle: BillingCycle): number {
  return (amount * CYCLES_PER_YEAR[cycle]) / 12;
}

export function yearlyEquivalent(amount: number, cycle: BillingCycle): number {
  return amount * CYCLES_PER_YEAR[cycle];
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrDecimal = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  return inr.format(Math.round(value));
}

export function formatINRCompact(value: number): string {
  const v = Math.round(value);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return inrDecimal.format(v);
}

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateShort = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso + "T00:00:00"));
}

export function formatDateShort(iso: string): string {
  return dateShort.format(new Date(iso + "T00:00:00"));
}

/** Whole days from `today` until the given ISO date (negative if past). */
export function daysUntil(iso: string, today = new Date()): number {
  const target = new Date(iso + "T00:00:00");
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - base.getTime()) / 86400000);
}

export function relativeDay(iso: string, today = new Date()): string {
  const d = daysUntil(iso, today);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 7) return `in ${d} days`;
  if (d < 30) return `in ${Math.round(d / 7)} wk`;
  return `in ${Math.round(d / 30)} mo`;
}
