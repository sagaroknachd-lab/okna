import { Capacitor } from "@capacitor/core";
import type { Subscription } from "./types";
import { formatDate, relativeDay } from "./format";

/**
 * Native renewal reminders. On a real device (Capacitor) this schedules a local
 * notification a few days before each active subscription renews, with an
 * earlier, louder nudge for manual "must not lapse" bills (insurance / utility).
 *
 * On the web build `Capacitor.isNativePlatform()` is false and every function is
 * a no-op, so the same code ships in the browser without touching the Web
 * Notifications API.
 */

const LEAD_DAYS = 3; // remind this many days before a normal renewal
const LAPSE_LEAD_DAYS = 5; // manual renewals get a bigger head start

const LAPSE_CATEGORIES = new Set(["insurance", "electricity", "gas"]);

/** Stable positive 31-bit integer id from a subscription's string id. */
function notificationId(subId: string): number {
  let h = 0;
  for (let i = 0; i < subId.length; i++) {
    h = (h * 31 + subId.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 2_000_000_000) + 1;
}

/** 9am, `offsetDays` before the given ISO renewal date. */
function remindAt(iso: string, offsetDays: number): Date {
  const d = new Date(iso + "T09:00:00");
  d.setDate(d.getDate() - offsetDays);
  return d;
}

/**
 * Reconcile scheduled notifications with the current portfolio: clear the old
 * ones and schedule a fresh reminder for every active, still-upcoming renewal.
 * Safe to call on every change — it fully replaces the previous schedule.
 */
export async function syncRenewalNotifications(
  subs: Subscription[],
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const { LocalNotifications } = await import("@capacitor/local-notifications");

  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return;

  // Wipe anything we scheduled before so cancellations/edits take effect.
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((n) => ({ id: n.id })),
    });
  }

  const now = Date.now();
  const notifications = [];

  for (const s of subs) {
    if (s.status !== "active") continue;

    const lapseRisk = !s.autoRenew && LAPSE_CATEGORIES.has(s.category);
    const lead = lapseRisk ? LAPSE_LEAD_DAYS : LEAD_DAYS;
    const at = remindAt(s.nextRenewal, lead);
    if (at.getTime() <= now) continue; // never schedule in the past

    notifications.push({
      id: notificationId(s.id),
      title: lapseRisk
        ? `⚠️ ${s.name} — renew to avoid a lapse`
        : `${s.name} renews ${relativeDay(s.nextRenewal)}`,
      body: lapseRisk
        ? `Manual renewal due ${formatDate(s.nextRenewal)}. Pay on time to keep cover and your no-claim bonus.`
        : `Due ${formatDate(s.nextRenewal)}. Open okna to review, switch or cancel if you no longer need it.`,
      schedule: { at },
      smallIcon: "ic_stat_icon_config_sample",
      channelId: "okna-renewals",
    });
  }

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }
}
