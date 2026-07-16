import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

const FEATURES = [
  {
    icon: "🔍",
    title: "Find",
    desc: "Import your bills and subscriptions in one place — nothing slips through the cracks.",
  },
  {
    icon: "📊",
    title: "Track",
    desc: "See exactly what you pay every month and where the money quietly disappears.",
  },
  {
    icon: "💡",
    title: "Reduce",
    desc: "Spot unused plans, duplicates and cheaper alternatives, then switch in a tap.",
  },
  {
    icon: "🔔",
    title: "Remind",
    desc: "Renewal alerts for insurance, EMIs and bills so you never pay a late fee again.",
  },
];

const PROBLEMS = [
  "Forgetting renewals",
  "Paying for unused subscriptions",
  "Missing cheaper plans",
  "Missing insurance dates",
  "Paying late fees",
  "Keeping expensive plans for years",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-ink-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              o
            </span>
            <span className="text-lg font-bold tracking-tight">okna</span>
          </span>
          <Link href="/app" className="btn-primary !py-2 text-sm">
            Open dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              🇮🇳 Built for Indian households
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Stop overpaying on every{" "}
              <span className="text-brand-600">bill & subscription</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-ink-600">
              One app that finds, tracks, reminds and helps reduce every recurring
              expense — mobile, broadband, OTT, insurance, EMIs, electricity and more.
              Your personal expense-saving assistant.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/app" className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
                Start saving — it&apos;s free
              </Link>
              <Link href="/app/savings" className="btn-ghost w-full px-6 py-3 text-base sm:w-auto">
                See how much you could save
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-400">
              No sign-up needed for the demo · Your data stays in your browser
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              A typical family bleeds money every month
            </h2>
            <p className="mt-4 text-ink-600">
              There&apos;s no single trusted place to manage everything you pay for on
              repeat. So money leaks — a little here, a little there — and it adds up
              to thousands a year.
            </p>
            <ul className="mt-6 space-y-2.5">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-ink-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs text-rose-600">
                    ✕
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              The okna difference
            </p>
            <p className="mt-3 text-2xl font-bold">
              ₹18,000<span className="text-lg font-normal text-ink-500">/year</span>
            </p>
            <p className="mt-1 text-ink-600">
              average savings a household can unlock by cutting waste and switching to
              cheaper plans.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["12+", "categories"],
                ["1", "dashboard"],
                ["0", "late fees"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white p-3">
                  <p className="text-xl font-bold text-brand-600">{n}</p>
                  <p className="text-xs text-ink-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Find, track, reduce — on autopilot
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <span className="text-3xl" aria-hidden>{f.icon}</span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you pay for, covered</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-600">
            From your Jio recharge to your term insurance premium — okna tracks it all
            in one clean dashboard.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${c.tint}`}>
                {c.emoji}
              </span>
              <span className="font-semibold text-ink-800">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Take control of your recurring expenses today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Try the live demo with a real Indian household portfolio and watch okna
            surface savings in seconds.
          </p>
          <Link
            href="/app"
            className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-base font-semibold text-brand-700 hover:bg-brand-50"
          >
            Open the dashboard →
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink-400 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} okna — your money, saved.</span>
          <span>Demo data is illustrative. Prices are representative.</span>
        </div>
      </footer>
    </div>
  );
}
