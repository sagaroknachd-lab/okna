# okna

**Your personal expense-saving assistant for India.**

One app that finds, tracks, reminds and helps reduce every recurring expense a
middle-class Indian household pays for — mobile plans, broadband, OTT, insurance,
credit-card fees, loan EMIs, electricity, gas, school fees, gym, software and
memberships.

People forget renewals, keep paying for subscriptions they never use, miss cheaper
plans, and let insurance lapse. There's no single trusted place to manage it all —
so money quietly leaks every month. okna is that place.

## What it does

- **Track** every recurring bill and subscription in one dashboard, with monthly
  and yearly spend normalised across billing cycles.
- **Reduce** — a savings engine scans your portfolio for:
  - **Unused** discretionary plans (rarely / never used)
  - **Cheaper alternatives** in the same category (a curated plan marketplace)
  - **Duplicate** services from the same provider
  - **Monthly → annual** billing switches that cut cost
- **Remind** — renewals bucketed by urgency (overdue / this week / this month /
  later), plus a **"must not lapse"** alert for manual insurance and utility
  renewals so you never lose cover, a no-claim bonus, or pay a late fee.
- **Act** — cancel, pause, switch plan, mark paid, or toggle auto-renew in a tap,
  with spend and savings recomputed live.

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page |
| `/app` | Overview — spend breakdown, top savings, upcoming renewals |
| `/app/subscriptions` | Full list with search, filter, sort, add/edit/remove |
| `/app/savings` | Ranked, actionable savings opportunities |
| `/app/reminders` | Renewals by urgency + lapse-risk alerts |

## Tech

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- Client-side state in a React context store, persisted to **localStorage**
  (no backend required — the demo seeds a realistic Indian household portfolio)

The data layer (`src/lib`) is structured so the store can later be swapped for a
real API without touching the UI.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm run start   # production build
```

## Project structure

```
src/
  app/                 # routes (landing + /app dashboard)
  components/          # UI: shell, forms, list, charts, chips
  lib/
    types.ts           # domain model
    categories.ts      # category metadata (labels, colours)
    plans.ts           # curated plan marketplace for comparisons
    seed.ts            # demo portfolio (dates relative to today)
    format.ts          # rupee + date + billing-cycle helpers
    insights.ts        # the savings engine
    stats.ts           # portfolio aggregates + renewals
    store.tsx          # localStorage-backed React store
```

> Prices and plans are illustrative and for demonstration only.
