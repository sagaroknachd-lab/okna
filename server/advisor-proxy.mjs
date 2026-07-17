// okna AI Advisor — backend proxy.
//
// Holds the Anthropic API key server-side and streams Claude's reply to the
// okna web app / Android app. The client never sees the key. Deploy this
// anywhere that runs Node 18+ (Render, Railway, Fly, a VPS, Docker, or a
// serverless Node runtime) and point the app at it via NEXT_PUBLIC_ADVISOR_API_URL.
//
// Env:
//   ANTHROPIC_API_KEY   (required) your Anthropic key
//   ADVISOR_MODEL       (optional) default claude-opus-4-8
//   ALLOWED_ORIGIN      (optional) CORS origin allow-list, comma-separated, or * (default *)
//   ADVISOR_APP_TOKEN   (optional) if set, clients must send it as x-app-token
//   ANTHROPIC_BASE_URL  (optional) default https://api.anthropic.com
//   PORT                (optional) default 8787

import http from "node:http";
import { Readable } from "node:stream";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.ADVISOR_MODEL || "claude-opus-4-8";
const BASE = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
const APP_TOKEN = process.env.ADVISOR_APP_TOKEN || "";
const ALLOWED = (process.env.ALLOWED_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const PORT = Number(process.env.PORT || 8787);
const MAX_TOKENS = Number(process.env.ADVISOR_MAX_TOKENS || 1024);

// The advisor's fixed persona + rules. Portfolio DATA is supplied per-request
// by the client as `context`; the instructions and model stay server-side so
// clients can't tamper with them.
const INSTRUCTIONS = [
  "You are okna's AI savings advisor for middle-class Indian households.",
  "Your job: help the user minimise recurring monthly spend — subscriptions, bills, insurance, credit-card fees, loans — and suggest cheaper vendor options and concrete tips.",
  "",
  "Style: warm, concise, specific. Prefer a few short sentences or a tight bullet list. Always denominate in rupees (₹).",
  "Ground every suggestion in the user's actual portfolio in the context below. Give concrete next steps: switch monthly→annual, cancel unused plans, consolidate duplicates, move to a cheaper vendor, renew insurance before it lapses.",
  "Any prices or plans you mention are indicative — say 'typically around' and tell the user to verify the current offer. Never claim a specific plan exists at an exact live price.",
  "Do not invent portfolio items the user doesn't have. If you don't have enough info, ask one short clarifying question.",
].join("\n");

function corsOrigin(reqOrigin) {
  if (ALLOWED.includes("*")) return "*";
  if (reqOrigin && ALLOWED.includes(reqOrigin)) return reqOrigin;
  return ALLOWED[0] || "*";
}

function setCors(res, reqOrigin) {
  res.setHeader("Access-Control-Allow-Origin", corsOrigin(reqOrigin));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-app-token");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(body);
}

function readBody(req, limit = 200_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Validate + normalise the chat turns the client sent. */
function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const trimmed = raw.slice(-20); // cap history
  const out = [];
  for (const m of trimmed) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
    if (typeof m.content !== "string") return null;
    out.push({ role: m.role, content: m.content.slice(0, 8000) });
  }
  if (out[0].role !== "user") return null; // must start with a user turn
  return out;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  setCors(res, origin);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, model: MODEL, keyConfigured: Boolean(API_KEY) });
    return;
  }

  if (req.method !== "POST" || (url.pathname !== "/advisor" && url.pathname !== "/")) {
    sendJson(res, 404, { error: { message: "Not found" } });
    return;
  }

  if (!API_KEY) {
    sendJson(res, 500, { error: { message: "Server missing ANTHROPIC_API_KEY" } });
    return;
  }

  if (APP_TOKEN && req.headers["x-app-token"] !== APP_TOKEN) {
    sendJson(res, 401, { error: { message: "Invalid app token" } });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: { message: "Invalid JSON body" } });
    return;
  }

  const messages = sanitizeMessages(payload.messages);
  if (!messages) {
    sendJson(res, 400, { error: { message: "messages must be a non-empty user/assistant list starting with a user turn" } });
    return;
  }
  const context = typeof payload.context === "string" ? payload.context.slice(0, 12_000) : "";
  const system = context ? `${INSTRUCTIONS}\n\n${context}` : INSTRUCTIONS;

  let upstream;
  try {
    upstream = await fetch(`${BASE}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        thinking: { type: "adaptive" },
        output_config: { effort: "low" },
        system,
        messages,
      }),
    });
  } catch (e) {
    sendJson(res, 502, { error: { message: `Upstream request failed: ${String(e)}` } });
    return;
  }

  if (!upstream.ok || !upstream.body) {
    let message = `Upstream error (${upstream.status})`;
    try {
      const err = await upstream.json();
      message = err?.error?.message ?? message;
    } catch {
      /* keep default */
    }
    sendJson(res, upstream.status === 401 ? 502 : upstream.status, { error: { message } });
    return;
  }

  // Forward Anthropic's SSE stream straight through to the client.
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
  });
  try {
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`okna advisor proxy listening on :${PORT} (model ${MODEL}, key ${API_KEY ? "set" : "MISSING"})`);
});
