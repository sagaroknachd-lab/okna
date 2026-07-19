"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { syncRenewalNotifications } from "@/lib/notifications";

/**
 * Headless: keeps native renewal notifications in sync with the portfolio.
 * Renders nothing; on the web build the sync is a no-op.
 */
export function NotificationsSync() {
  const { subscriptions, ready } = useStore();

  useEffect(() => {
    if (!ready) return;
    syncRenewalNotifications(subscriptions).catch(() => {
      /* notifications are best-effort; never break the app */
    });
  }, [subscriptions, ready]);

  return null;
}
