"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Subscription } from "./types";
import { defaultSubscriptions } from "./seed";

const STORAGE_KEY = "okna.subscriptions.v1";

export type SubscriptionInput = Omit<Subscription, "id" | "createdAt">;

interface StoreValue {
  subscriptions: Subscription[];
  ready: boolean;
  add: (input: SubscriptionInput) => void;
  update: (id: string, patch: Partial<SubscriptionInput>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: Subscription["status"]) => void;
  replaceAll: (subs: Subscription[]) => void;
  clear: () => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function makeId(): string {
  return `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSubscriptions(JSON.parse(raw) as Subscription[]);
      } else {
        setSubscriptions(defaultSubscriptions());
      }
    } catch {
      setSubscriptions(defaultSubscriptions());
    }
    setReady(true);
  }, []);

  // Persist whenever data changes (after hydration).
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [subscriptions, ready]);

  const value = useMemo<StoreValue>(
    () => ({
      subscriptions,
      ready,
      add: (input) =>
        setSubscriptions((prev) => [
          { ...input, id: makeId(), createdAt: new Date().toISOString() },
          ...prev,
        ]),
      update: (id, patch) =>
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        ),
      remove: (id) =>
        setSubscriptions((prev) => prev.filter((s) => s.id !== id)),
      setStatus: (id, status) =>
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s)),
        ),
      replaceAll: (subs) => setSubscriptions(subs),
      clear: () => setSubscriptions([]),
      reset: () => setSubscriptions(defaultSubscriptions()),
    }),
    [subscriptions, ready],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
