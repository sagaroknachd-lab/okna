import type {
  BillingCycle,
  CategoryId,
  Subscription,
  SubStatus,
  UsageFrequency,
} from "./types";

/**
 * Portability layer for the local-first portfolio: turn the store's
 * subscriptions into a versioned JSON file the user can download, and validate
 * such a file back into subscriptions on import. Kept deliberately strict so a
 * malformed or hand-edited file can never corrupt the store.
 */

export const BACKUP_VERSION = 1;

export interface OknaBackup {
  app: "okna";
  version: number;
  exportedAt: string; // ISO timestamp
  subscriptions: Subscription[];
}

const CATEGORIES: ReadonlySet<CategoryId> = new Set<CategoryId>([
  "mobile",
  "broadband",
  "ott",
  "insurance",
  "credit-card",
  "loan-emi",
  "electricity",
  "gas",
  "school-fees",
  "gym",
  "software",
  "membership",
]);

const CYCLES: ReadonlySet<BillingCycle> = new Set<BillingCycle>([
  "monthly",
  "quarterly",
  "half-yearly",
  "yearly",
]);

const STATUSES: ReadonlySet<SubStatus> = new Set<SubStatus>([
  "active",
  "paused",
  "cancelled",
]);

const USAGE: ReadonlySet<UsageFrequency> = new Set<UsageFrequency>([
  "daily",
  "weekly",
  "monthly",
  "rarely",
  "never",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class BackupError extends Error {}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function coerceSubscription(raw: unknown, index: number): Subscription {
  if (!isObject(raw)) {
    throw new BackupError(`Item ${index + 1} is not a subscription object.`);
  }
  const bad = (field: string): never => {
    throw new BackupError(`Item ${index + 1} has an invalid "${field}".`);
  };

  const {
    id,
    name,
    provider,
    category,
    amount,
    cycle,
    nextRenewal,
    status,
    autoRenew,
    usage,
    notes,
    createdAt,
  } = raw as Record<string, unknown>;

  if (typeof name !== "string" || name.trim() === "") bad("name");
  if (typeof provider !== "string") bad("provider");
  if (typeof category !== "string" || !CATEGORIES.has(category as CategoryId))
    bad("category");
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0)
    bad("amount");
  if (typeof cycle !== "string" || !CYCLES.has(cycle as BillingCycle)) bad("cycle");
  if (typeof nextRenewal !== "string" || !ISO_DATE.test(nextRenewal))
    bad("nextRenewal");
  if (typeof status !== "string" || !STATUSES.has(status as SubStatus)) bad("status");
  if (typeof usage !== "string" || !USAGE.has(usage as UsageFrequency)) bad("usage");
  if (notes !== undefined && typeof notes !== "string") bad("notes");

  return {
    id: typeof id === "string" && id ? id : `sub-${Date.now().toString(36)}-${index}`,
    name: (name as string).trim(),
    provider: provider as string,
    category: category as CategoryId,
    amount: amount as number,
    cycle: cycle as BillingCycle,
    nextRenewal: nextRenewal as string,
    status: status as SubStatus,
    autoRenew: Boolean(autoRenew),
    usage: usage as UsageFrequency,
    notes: notes as string | undefined,
    createdAt:
      typeof createdAt === "string" && createdAt
        ? createdAt
        : new Date().toISOString(),
  };
}

/** Build a versioned backup payload from the current portfolio. */
export function buildBackup(subscriptions: Subscription[]): OknaBackup {
  return {
    app: "okna",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    subscriptions,
  };
}

/** Pretty-printed JSON string suitable for download. */
export function serializeBackup(subscriptions: Subscription[]): string {
  return JSON.stringify(buildBackup(subscriptions), null, 2);
}

/**
 * Parse and validate a backup file (or a bare array of subscriptions).
 * Throws BackupError with a human-readable message on anything malformed.
 */
export function parseBackup(raw: string): Subscription[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new BackupError("That doesn't look like valid JSON.");
  }

  let list: unknown;
  if (Array.isArray(data)) {
    list = data; // tolerate a bare subscriptions array
  } else if (isObject(data) && Array.isArray(data.subscriptions)) {
    if (data.app !== undefined && data.app !== "okna") {
      throw new BackupError("This backup isn't from okna.");
    }
    list = data.subscriptions;
  } else {
    throw new BackupError('Expected an okna backup with a "subscriptions" list.');
  }

  const arr = list as unknown[];
  if (arr.length === 0) {
    throw new BackupError("The backup has no subscriptions in it.");
  }
  return arr.map(coerceSubscription);
}

/** Suggested download filename, e.g. okna-backup-2026-07-16.json */
export function backupFilename(now = new Date()): string {
  return `okna-backup-${now.toISOString().slice(0, 10)}.json`;
}
