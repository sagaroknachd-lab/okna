import type { Subscription } from "./types";
import { portfolioSummary, advisorTips, vendorAlternatives } from "./advisor";
import { category } from "./categories";
import { formatINR } from "./format";

/**
 * Live-AI layer for the advisor chat. Three modes, in priority order:
 *
 *  1. "proxy" — NEXT_PUBLIC_ADVISOR_API_URL is set at build time. The app calls
 *     the okna backend proxy (see /server), which holds the Anthropic key
 *     server-side and streams Claude's reply. This is the production path: live
 *     AI for every user, no key on the device.
 *  2. "key"   — the user pasted their own Anthropic key in Settings. The app
 *     calls Anthropic directly from the browser (owner / power-user path).
 *  3. "off"   — neither is configured; the advisor uses the offline responder.
 *
 * We use plain `fetch` (not the Node SDK, which imports node:path and can't
 * bundle into this static export).
 */

const KEY_STORAGE = "okna.anthropic.key.v1";
const MODEL = "claude-opus-4-8";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const PROXY_URL = process.env.NEXT_PUBLIC_ADVISOR_API_URL || "";
const PROXY_TOKEN = process.env.NEXT_PUBLIC_ADVISOR_APP_TOKEN || "";

// Fixed advisor persona for the direct-key path. The proxy keeps its own copy
// server-side so it stays authoritative when running in production.
const INSTRUCTIONS = [
  "You are okna's AI savings advisor for middle-class Indian households.",
  "Your job: help the user minimise recurring monthly spend — subscriptions, bills, insurance, credit-card fees, loans — and suggest cheaper vendor options and concrete tips.",
  "",
  "Style: warm, concise, specific. Prefer a few short sentences or a tight bullet list. Always denominate in rupees (₹).",
  "Ground every suggestion in the user's actual portfolio in the context below. Give concrete next steps: switch monthly→annual, cancel unused plans, consolidate duplicates, move to a cheaper vendor, renew insurance before it lapses.",
  "Any prices or plans you mention are indicative — say 'typically around' and tell the user to verify the current offer. Never claim a specific plan exists at an exact live price.",
  "Do not invent portfolio items the user doesn't have. If you don't have enough info, ask one short clarifying question.",
].join("\n");

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

export type LiveMode = "proxy" | "key" | "off";

export function liveMode(): LiveMode {
  if (PROXY_URL) return "proxy";
  if (getApiKey().startsWith("sk-")) return "key";
  return "off";
}

export function hasLiveAI(): boolean {
  return liveMode() !== "off";
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Portfolio grounding block (data only — no instructions). */
function groundingContext(subs: Subscription[]): string {
  const tips = advisorTips(subs);
  const vendorLines: string[] = [];
  for (const m of vendorAlternatives(subs).slice(0, 6)) {
    const best = m.options[0];
    vendorLines.push(
      `- ${category(m.subscription.category).label}: ${m.subscription.name} → consider ${best.provider} ${best.plan} (~${formatINR(best.monthlySaving)}/mo less).`,
    );
  }
  return [
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

/** Read an Anthropic-style SSE stream, calling onDelta with text as it arrives. */
async function readSse(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
): Promise<string> {
  const reader = body.getReader();
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

async function errorMessage(res: Response): Promise<string> {
  try {
    const err = await res.json();
    return err?.error?.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/**
 * Stream a live reply. Uses the proxy when configured, else a per-device key.
 * Calls `onDelta` with incremental text; resolves with the full text. Throws on
 * auth/network errors so the caller can fall back to the offline responder.
 */
export async function streamLiveReply(
  subs: Subscription[],
  history: ChatTurn[],
  onDelta: (text: string) => void,
): Promise<string> {
  const mode = liveMode();
  const context = groundingContext(subs);
  const messages = history.map((t) => ({ role: t.role, content: t.content }));

  if (mode === "proxy") {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (PROXY_TOKEN) headers["x-app-token"] = PROXY_TOKEN;
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ context, messages }),
    });
    if (!res.ok || !res.body) throw new Error(await errorMessage(res));
    return readSse(res.body, onDelta);
  }

  if (mode === "key") {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": getApiKey(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        stream: true,
        thinking: { type: "adaptive" },
        output_config: { effort: "low" },
        system: `${INSTRUCTIONS}\n\n${context}`,
        messages,
      }),
    });
    if (!res.ok || !res.body) {
      const msg = await errorMessage(res);
      throw new Error(res.status === 401 ? `authentication: ${msg}` : msg);
    }
    return readSse(res.body, onDelta);
  }

  throw new Error("Live AI is not configured.");
}
