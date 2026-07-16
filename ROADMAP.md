# okna — Roadmap / Board

The working board for okna. Keeps the "what's next" honest so the demo can grow
into a real product without losing the thread. Grouped by stage; check items off
as they ship.

Legend: ✅ done · 🚧 in progress · ⬜ next up · 💡 later / idea

---

## Now shipped (v0.1)

- ✅ Landing page + `/app` dashboard shell (sidebar + mobile nav)
- ✅ Domain model, category metadata, curated plan marketplace
- ✅ localStorage-backed store with seeded Indian-household portfolio
- ✅ Overview: spend breakdown, top savings, upcoming renewals
- ✅ Subscriptions: list with search / filter / sort / add / edit / remove
- ✅ Savings engine: unused, cheaper-plan, duplicate, annual-switch insights
- ✅ Reminders: urgency buckets + "must not lapse" alerts, mark-paid, auto-renew

## In progress

- 🚧 **Data & Settings** (`/app/settings`) — export / import / reset / clear the
  local portfolio so people can back up and move their data. _First step toward
  a real persistence layer; keeps the local-first demo trustworthy._

## Next up

- ⬜ **Reminder lead-time preference** — let users pick how many days ahead a
  renewal counts as "due soon", and surface it consistently across Overview and
  Reminders.
- ⬜ **Category drill-down** (`/app/category/[id]`) — per-category spend, plan
  list and the cheaper alternatives for that category in one place.
- ⬜ **Empty / onboarding state** — first-run flow for a portfolio with zero
  subscriptions instead of the seeded demo.
- ⬜ **Savings history** — track actioned insights so "you saved ₹X this year"
  is real, not just potential.

## Later / ideas

- 💡 Real backend + auth (swap the store for an API — the `lib` layer is already
  shaped for this) with per-user portfolios.
- 💡 Push / email renewal reminders (needs backend + notifications).
- 💡 Bank / UPI statement import to auto-detect recurring charges.
- 💡 Shared household portfolios (multiple members, one dashboard).
- 💡 PWA install + offline support.
- 💡 Automated tests (unit for `lib`, component/E2E for the flows).

---

_Prices and plans in the app are illustrative and for demonstration only._
