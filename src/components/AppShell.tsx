"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { SubscriptionForm } from "@/components/SubscriptionForm";

const NAV = [
  { href: "/app", label: "Overview", icon: "📊" },
  { href: "/app/subscriptions", label: "Subscriptions", icon: "🗂️" },
  { href: "/app/savings", label: "Savings", icon: "💡" },
  { href: "/app/reminders", label: "Reminders", icon: "🔔" },
  { href: "/app/settings", label: "Settings", icon: "⚙️" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { add } = useStore();
  const [adding, setAdding] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink-100 bg-white p-4 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <Logo />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="btn-primary mt-4 w-full" onClick={() => setAdding(true)}>
          <span aria-hidden>＋</span> Add subscription
        </button>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
          <button className="btn-primary !px-3 !py-2 text-xs" onClick={() => setAdding(true)}>
            ＋ Add
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-ink-100 bg-white lg:hidden">
          {NAV.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  active ? "text-brand-700" : "text-ink-500"
                }`}
              >
                <span aria-hidden className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {adding && (
        <SubscriptionForm
          onClose={() => setAdding(false)}
          onSubmit={(input) => {
            add(input);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        o
      </span>
      <span className="text-lg font-bold tracking-tight text-ink-900">okna</span>
    </span>
  );
}
