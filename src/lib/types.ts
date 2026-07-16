export type CategoryId =
  | "mobile"
  | "broadband"
  | "ott"
  | "insurance"
  | "credit-card"
  | "loan-emi"
  | "electricity"
  | "gas"
  | "school-fees"
  | "gym"
  | "software"
  | "membership";

export type BillingCycle =
  | "monthly"
  | "quarterly"
  | "half-yearly"
  | "yearly";

export type SubStatus = "active" | "paused" | "cancelled";

export type UsageFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "rarely"
  | "never";

export interface Subscription {
  id: string;
  name: string;
  provider: string;
  category: CategoryId;
  amount: number; // rupees per billing cycle
  cycle: BillingCycle;
  nextRenewal: string; // ISO date (yyyy-mm-dd)
  status: SubStatus;
  autoRenew: boolean;
  usage: UsageFrequency;
  notes?: string;
  createdAt: string;
}

export interface MarketPlan {
  id: string;
  category: CategoryId;
  provider: string;
  name: string;
  amount: number;
  cycle: BillingCycle;
  features: string[];
  highlight?: string;
}

export type InsightKind =
  | "unused"
  | "cheaper-plan"
  | "duplicate"
  | "annual-switch"
  | "renewal-soon"
  | "auto-renew-off";

export interface Insight {
  id: string;
  kind: InsightKind;
  subscriptionId: string;
  title: string;
  detail: string;
  monthlySaving: number; // estimated ₹/month saved if actioned
  cta: string;
  planId?: string;
}
