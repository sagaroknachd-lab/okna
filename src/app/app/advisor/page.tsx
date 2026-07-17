"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  buildSavingsPlan,
  vendorAlternatives,
  advisorTips,
  answerQuestion,
} from "@/lib/advisor";
import { hasLiveAI, streamLiveReply, type ChatTurn } from "@/lib/aiClient";
import { category } from "@/lib/categories";
import { formatINR } from "@/lib/format";

const SUGGESTIONS = [
  "What's my biggest saving?",
  "How do I lower my mobile plan?",
  "Which subscriptions am I not using?",
  "Cheaper insurance options?",
];

export default function AdvisorPage() {
  const { subscriptions, ready } = useStore();
  const [live, setLive] = useState(false);
  useEffect(() => setLive(hasLiveAI()), []);

  const { plan, vendors, tips } = useMemo(
    () => ({
      plan: buildSavingsPlan(subscriptions),
      vendors: vendorAlternatives(subscriptions),
      tips: advisorTips(subscriptions),
    }),
    [subscriptions],
  );

  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-ink-100" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            AI Savings Advisor
          </h1>
          <p className="mt-1 text-ink-500">
            A plan to cut your monthly spend, cheaper vendor options, and answers
            to your money questions.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            live ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
          }`}
        >
          {live ? "⚡ Live AI (Claude)" : "🤖 Smart assistant"}
        </span>
      </div>

      {/* Headline plan */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
        <p className="text-sm font-medium text-brand-100">Your savings plan targets</p>
        <div className="mt-1 flex flex-wrap items-end gap-x-6 gap-y-1">
          <span className="text-4xl font-bold">
            {formatINR(plan.monthlyTarget)}
            <span className="text-lg font-normal text-brand-200">/mo</span>
          </span>
          <span className="text-brand-100">
            up to <strong className="text-white">{formatINR(plan.yearlyTarget)}</strong> a year
          </span>
        </div>
        <p className="mt-3 text-sm text-brand-100">
          {plan.steps.length} action{plan.steps.length === 1 ? "" : "s"} across your portfolio
        </p>
      </div>

      {plan.lapseWarnings.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="font-semibold text-rose-800">⚠️ Don&apos;t let these lapse</p>
          <ul className="mt-1 space-y-1 text-sm text-rose-700">
            {plan.lapseWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Plan steps */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Your action plan</h2>
          <Link href="/app/savings" className="text-sm font-semibold text-brand-600">
            Action in Savings →
          </Link>
        </div>
        {plan.steps.length === 0 ? (
          <p className="text-sm text-ink-500">
            You&apos;re running lean — no obvious savings right now. 🎉
          </p>
        ) : (
          <ol className="space-y-3">
            {plan.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink-900">{s.title}</p>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                      +{formatINR(s.monthlySaving)}/mo
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Vendor alternatives */}
      {vendors.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-1 font-semibold text-ink-900">Switch &amp; save — vendor options</h2>
          <p className="mb-4 text-sm text-ink-500">
            Cheaper alternatives in the categories you spend on. Prices are indicative — verify the current offer.
          </p>
          <div className="space-y-4">
            {vendors.map((m) => (
              <div key={m.subscription.id} className="rounded-xl border border-ink-100 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span aria-hidden>{category(m.subscription.category).emoji}</span>
                  <p className="font-medium text-ink-900">{m.subscription.name}</p>
                  <span className="text-xs text-ink-400">
                    now {formatINR(m.currentMonthly)}/mo
                  </span>
                </div>
                <ul className="space-y-2">
                  {m.options.map((o, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-2 text-sm">
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                        −{formatINR(o.monthlySaving)}/mo
                      </span>
                      <span className="font-medium text-ink-800">
                        {o.provider} {o.plan}
                      </span>
                      <span className="w-full text-ink-500 sm:w-auto sm:flex-1">{o.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-ink-900">Tips &amp; tricks</h2>
        <ul className="space-y-2 text-sm text-ink-700">
          {tips.general.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-brand-600">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        {tips.byCategory.map((c) => (
          <div key={c.category} className="mt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
              {category(c.category).label}
            </p>
            <ul className="space-y-1.5 text-sm text-ink-700">
              {c.tips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-ink-300">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Chat */}
      <Chat live={live} />
    </div>
  );
}

interface Msg extends ChatTurn {
  id: string;
}

function Chat({ live }: { live: boolean }) {
  const { subscriptions } = useStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setNote(null);
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: q };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);

    if (live) {
      const assistantId = `a-${Date.now()}`;
      setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);
      try {
        await streamLiveReply(
          subscriptions,
          history.map(({ role, content }) => ({ role, content })),
          (delta) =>
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: msg.content + delta } : msg,
              ),
            ),
        );
      } catch (err) {
        // fall back to the offline responder
        const answer = answerQuestion(subscriptions, q);
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, content: answer } : msg)),
        );
        setNote(
          err instanceof Error && /api key|401|authentication/i.test(err.message)
            ? "Live AI failed (check your API key in Settings) — answered offline."
            : "Live AI unavailable — answered offline.",
        );
      }
    } else {
      const answer = answerQuestion(subscriptions, q);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: answer }]);
    }
    setBusy(false);
  }

  return (
    <section className="card flex flex-col overflow-hidden">
      <div className="border-b border-ink-100 px-5 py-3">
        <h2 className="font-semibold text-ink-900">Ask okna AI</h2>
        <p className="text-xs text-ink-400">
          {live
            ? "Powered by Claude · answers grounded in your portfolio"
            : "Offline assistant · add an API key in Settings for live AI"}
        </p>
      </div>

      <div ref={scrollRef} className="max-h-96 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-500">
              Ask me anything about cutting your monthly spend. Try:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-brand-600 text-white"
                    : "bg-ink-50 text-ink-800"
                }`}
              >
                {m.content || (busy ? "…" : "")}
              </div>
            </div>
          ))
        )}
      </div>

      {note && (
        <p className="px-5 pb-1 text-xs text-amber-600">{note}</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-ink-100 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How can I cut my bills?"
          className="input"
          disabled={busy}
        />
        <button type="submit" className="btn-primary shrink-0" disabled={busy || !input.trim()}>
          {busy ? "…" : "Send"}
        </button>
      </form>
    </section>
  );
}
