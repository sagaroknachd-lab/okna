import type { CategoryId } from "./types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  emoji: string;
  /** tailwind text + bg tint for chips */
  tint: string;
  /** hex used for charts */
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "mobile", label: "Mobile", emoji: "📱", tint: "bg-sky-50 text-sky-700", color: "#0ea5e9" },
  { id: "broadband", label: "Broadband", emoji: "🌐", tint: "bg-indigo-50 text-indigo-700", color: "#6366f1" },
  { id: "ott", label: "OTT & Streaming", emoji: "🎬", tint: "bg-rose-50 text-rose-700", color: "#f43f5e" },
  { id: "insurance", label: "Insurance", emoji: "🛡️", tint: "bg-emerald-50 text-emerald-700", color: "#10b981" },
  { id: "credit-card", label: "Credit Card", emoji: "💳", tint: "bg-violet-50 text-violet-700", color: "#8b5cf6" },
  { id: "loan-emi", label: "Loan EMI", emoji: "🏦", tint: "bg-amber-50 text-amber-700", color: "#f59e0b" },
  { id: "electricity", label: "Electricity", emoji: "⚡", tint: "bg-yellow-50 text-yellow-700", color: "#eab308" },
  { id: "gas", label: "Gas", emoji: "🔥", tint: "bg-orange-50 text-orange-700", color: "#f97316" },
  { id: "school-fees", label: "School Fees", emoji: "🎓", tint: "bg-teal-50 text-teal-700", color: "#14b8a6" },
  { id: "gym", label: "Gym & Fitness", emoji: "🏋️", tint: "bg-lime-50 text-lime-700", color: "#84cc16" },
  { id: "software", label: "Software", emoji: "🧩", tint: "bg-cyan-50 text-cyan-700", color: "#06b6d4" },
  { id: "membership", label: "Memberships", emoji: "⭐", tint: "bg-pink-50 text-pink-700", color: "#ec4899" },
];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export function category(id: CategoryId): CategoryMeta {
  return byId.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
}
