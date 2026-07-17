import type { Subscription } from "./types";
import { portfolioSummary, advisorTips, vendorAlternatives } from "./advisor";
import { category } from "./categories";
import { formatINR } from "./format";

/**
 * Optional live-AI layer. When the user has stored an Anthropic API key, the
 * advisor chat is powered by Claude (streaming); otherwise the app falls back
 * to the deterministic responder in advisor.ts.
 *
 * This is a browser-only static app (it ships as a static export inside the
 * Android shell), so we call the Messages API directly with `fetch` + the
 * `anthropic-dangerous-direct-browser-access` header rather than the Node SDK
 * (which imports `node:path` and can't bundle for the client).
 *
 * The key is stored only on this device and sent straight to Anthropic. That's
 * fine for the app owner / power users, but for distributing to end customers
 * the key should live behind a backend proxy — see the note in Settings.
 */

const KEY_STORAGE = "okna.anthropic.key.v1";
const MODEL = "claude-opus-4-8";
const API_URL = "https://api.anthropic.com/v1/messages";

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setApiKey(key: string): void {
  try {
    if (key.trim()) window.localStorage.setItem(KEY_STORAGE, key.trim());
    else window.localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore storage errors */
  }
}

export function hasLiveAI(): boolean {
  return getApiKey().startsWith("sk-");
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function systemPrompt(subs: Subscription[]): string {
  const tips = advisorTips(subs);
  const vendorLines: string[] = [];
  for (const m of vendorAlternatives(subs).slice(0, 6)) {
    const best = m.options[0];
    vendorLines.push(
      `- ${category(m.subscription.category).label}: ${m.subscription.name} → consider ${best.provider} ${best.plan} (~${formatINR(best.monthlySaving)}/mo less).`,
    );
  }

  return [
    "You are okna's AI savings advisor for middle-class Indian households.",
    "Your job: help the user minimise recurring monthly spend — subscriptions, bills, insurance, credit-card fees, loans — and suggest cheaper vendor options and concrete tips.",
    "",
    "Style: warm, concise, specific. Prefer a few short sentences or a tight bullet list. Always denominate in rupees (₹).",
    "Ground every suggestion in the user's actual portfolio below. Give concrete next steps: switch monthly→annual, cancel unused plans, consolidate duplicates, move to a cheaper vendor, renew insurance before it lapses.",
    "Any prices or plans you mention are indicative for illustration — say 'typically around' and tell the user to verify the current offer. Never claim a specific plan exists at an exact live price.",
    "Do not invent portfolio items the user doesn't have. If you don't have enough info, ask one short clarifying question.",
    "",
    "USER PORTFOLIO:",
    portfolioSummary(subs),
    "",
    vendorLines.length ? "CHEAPER VENDOR LEADS:\n" + vendorLines.join("\n") : "",
    "",
    "GENERAL LEVERS:\n" + tips.general.map((t) => "- " + t).join("\n"),
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Stream a live Claude reply. Calls `onDelta` with incremental text and
 * resolves with the full text. Throws on auth/network errors so the caller can
 * surface the problem or fall back to the offline responder.
 */
export async function streamLiveReply(
  subs: Subscription[],
  history: ChatTurn[],
  onDelta: (text: string) => void,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No API key configured.");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: systemPrompt(subs),
      messages: history.map((t) => ({ role: t.role, content: t.content })),
    }),
  });

  if (!res.ok || !res.body) {
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      message = err?.error?.message ?? message;
    } catch {
      /* keep default */
    }
    throw new Error(res.status === 401 ? `authentication: ${message}` : message);
  }

  // Parse the SSE stream and accumulate text deltas.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload);
        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta" &&
          typeof event.delta.text === "string"
        ) {
          full += event.delta.text;
          onDelta(event.delta.text);
        } else if (event.type === "error") {
          throw new Error(event.error?.message ?? "stream error");
        }
      } catch {
        /* ignore malformed SSE chunks */
      }
    }
  }

  return full;
}
