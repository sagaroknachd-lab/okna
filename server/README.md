# okna AI Advisor — backend proxy

This tiny Node service powers okna's **AI Advisor** with Claude while keeping
your Anthropic API key **server-side**. The web app and the Android app call
this proxy; the proxy calls Anthropic and streams the reply back. End users
never see (or need) a key.

```
okna web / APK  ──POST /advisor──▶  this proxy  ──/v1/messages──▶  Anthropic (Claude)
     ▲                                  │
     └──────────  SSE stream  ◀─────────┘   (key stays here)
```

It has **zero npm dependencies** (Node standard library only) and needs Node 18+.

## Run locally

```bash
cd server
cp .env.example .env         # then put your ANTHROPIC_API_KEY in .env
node --env-file=.env advisor-proxy.mjs
# → okna advisor proxy listening on :8787
curl localhost:8787/health   # {"ok":true,"model":"claude-opus-4-8","keyConfigured":true}
```

## Point the app at it

Build the okna app with the proxy URL baked in:

```bash
# from the repo root
NEXT_PUBLIC_ADVISOR_API_URL=https://your-proxy-host/advisor npm run build
# (add NEXT_PUBLIC_ADVISOR_APP_TOKEN=... too if you set ADVISOR_APP_TOKEN)
```

When `NEXT_PUBLIC_ADVISOR_API_URL` is set, the Advisor chat runs live on Claude
through the proxy for **every** user. When it is not set, the app still works —
it uses the built-in offline advisor, or a per-device key from Settings.

For the Android app, rebuild after that: `npx cap sync android` then
`cd android && gradle assembleRelease bundleRelease`.

## Deploy

Any Node host works — it's a single file with no build step.

- **Docker:** `docker build -t okna-advisor server && docker run -p 8787:8787 --env-file server/.env okna-advisor`
- **Render / Railway / Fly:** root/dir = `server`, start command `npm start`, set the env vars from `.env.example`.
- **VPS / systemd:** `node advisor-proxy.mjs` behind nginx/Caddy for TLS.
- **Serverless (Vercel/Cloudflare):** adapt the single request handler in
  `advisor-proxy.mjs` to the platform's handler signature — the Anthropic call
  and SSE pass-through are the same.

## Configuration

| Env | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic key (kept server-side) |
| `ADVISOR_MODEL` | | Model id (default `claude-opus-4-8`) |
| `ADVISOR_MAX_TOKENS` | | Output cap per reply (default 1024) |
| `ALLOWED_ORIGIN` | | CORS allow-list, comma-separated, or `*` (default) |
| `ADVISOR_APP_TOKEN` | | Shared secret; if set, clients must send `x-app-token` |
| `PORT` | | Listen port (default 8787) |
| `ANTHROPIC_BASE_URL` | | Override Anthropic host |

## Endpoints

- `GET /health` → `{ ok, model, keyConfigured }`
- `POST /advisor` → body `{ "context": "<portfolio grounding>", "messages": [{ "role": "user", "content": "..." }] }`; responds with an Anthropic-style SSE stream of `content_block_delta` text.

## Notes / hardening for production

- Put it behind TLS (a proxy calling Anthropic over plain HTTP would expose traffic).
- Restrict `ALLOWED_ORIGIN` to your real web origin + the app's WebView origin.
- Set `ADVISOR_APP_TOKEN` and add real rate-limiting / auth if this is public —
  the proxy validates input and caps history, but does not authenticate users.
