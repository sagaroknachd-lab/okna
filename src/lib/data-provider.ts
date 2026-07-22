import { db } from "./db";

/**
 * DataProvider — the single seam through which okna reads a person's money
 * picture.
 *
 * SAFETY GUARDRAIL (non-negotiable): this interface is READ-ONLY and advisory.
 * There is deliberately no method to move money, capture bank credentials,
 * accept an OTP, or store a card/UPI PIN. The MVP is backed entirely by mock /
 * sample data in local SQLite (SampleDataProvider below).
 *
 * A real RBI Account Aggregator (AA) integration would later implement this
 * same interface — fetching consented, read-only financial statements through
 * the AA framework — WITHOUT changing any UI or engine code. Credential capture
 * (if it ever exists) would live inside that future provider and go through the
 * AA consent flow, never through okna directly. It is intentionally not modelled
 * or stubbed here.
 */
export interface DataProvider {
  /** The person we're advising. MVP returns the single sample user. */
  getUser(): Promise<UserView | null>;
  getTransactions(): Promise<TransactionView[]>;
  getRecurringItems(): Promise<RecurringItemView[]>;
  getGoals(): Promise<GoalView[]>;
  getSkills(): Promise<SkillView[]>;
  /** Whether this provider is serving clearly-labelled sample data. */
  readonly isSample: boolean;
}

// ---- Plain read models the UI/engines consume (dates as ISO strings) --------

export interface UserView {
  id: string;
  name: string;
  monthlyIncome: number;
  city: string;
  isSample: boolean;
}

export interface TransactionView {
  id: string;
  date: string; // ISO
  amount: number; // whole ₹, positive
  direction: "in" | "out";
  category: string;
  source: "upi" | "card" | "cash";
  note: string | null;
  categoryEdited: boolean;
}

export interface RecurringItemView {
  id: string;
  name: string;
  provider: string | null;
  category: string;
  amount: number;
  cycle: "monthly" | "quarterly" | "half-yearly" | "yearly";
  nextRenewal: string; // ISO
  kind: "subscription" | "emi" | "loan" | "bill";
  status: "active" | "paused" | "cancelled";
  autoRenew: boolean;
  usage: "daily" | "weekly" | "monthly" | "rarely" | "never" | null;
  notes: string | null;
}

export interface GoalView {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: string | null; // ISO or null
  savedSoFar: number;
  active: boolean;
}

export interface SkillView {
  id: string;
  tag: string;
  kind: "skill" | "interest";
  proficiency: "beginner" | "intermediate" | "advanced";
  hoursFreePerWeek: number;
}

/**
 * SampleDataProvider — reads the seeded sample user from local SQLite. This is
 * the ONLY provider wired up in the MVP. It never touches a real account.
 */
export class SampleDataProvider implements DataProvider {
  readonly isSample = true;

  async getUser(): Promise<UserView | null> {
    const u = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      monthlyIncome: u.monthlyIncome,
      city: u.city,
      isSample: u.isSample,
    };
  }

  async getTransactions(): Promise<TransactionView[]> {
    const u = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!u) return [];
    const rows = await db.transaction.findMany({
      where: { userId: u.id },
      orderBy: { date: "desc" },
    });
    return rows.map((t) => ({
      id: t.id,
      date: t.date.toISOString(),
      amount: t.amount,
      direction: t.direction as "in" | "out",
      category: t.category,
      source: t.source as "upi" | "card" | "cash",
      note: t.note,
      categoryEdited: t.categoryEdited,
    }));
  }

  async getRecurringItems(): Promise<RecurringItemView[]> {
    const u = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!u) return [];
    const rows = await db.recurringItem.findMany({
      where: { userId: u.id },
      orderBy: { nextRenewal: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      provider: r.provider,
      category: r.category,
      amount: r.amount,
      cycle: r.cycle as RecurringItemView["cycle"],
      nextRenewal: r.nextRenewal.toISOString(),
      kind: r.kind as RecurringItemView["kind"],
      status: r.status as RecurringItemView["status"],
      autoRenew: r.autoRenew,
      usage: r.usage as RecurringItemView["usage"],
      notes: r.notes,
    }));
  }

  async getGoals(): Promise<GoalView[]> {
    const u = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!u) return [];
    const rows = await db.goal.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((g) => ({
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      targetDate: g.targetDate ? g.targetDate.toISOString() : null,
      savedSoFar: g.savedSoFar,
      active: g.active,
    }));
  }

  async getSkills(): Promise<SkillView[]> {
    const u = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!u) return [];
    const rows = await db.skill.findMany({ where: { userId: u.id } });
    return rows.map((s) => ({
      id: s.id,
      tag: s.tag,
      kind: s.kind as "skill" | "interest",
      proficiency: s.proficiency as SkillView["proficiency"],
      hoursFreePerWeek: s.hoursFreePerWeek,
    }));
  }
}

/** The provider the app uses. Swap this line to change the backing source. */
export const dataProvider: DataProvider = new SampleDataProvider();
