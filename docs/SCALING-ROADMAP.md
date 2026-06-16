# Convoy — Scaling Instrumentation Roadmap

A phased build plan for the three scaling features (admin health metrics, ride-wants
demand capture, remembered community codes). Sequenced so each phase feeds the next,
with explicit MVP cuts and the open decisions that must be settled first.

Guiding principle: **density before breadth** — don't switch on a new community until
the current one is self-sustaining, and you can only know that if you're measuring it.

---

## ⚠️ Decisions to settle before building

### D1. Membership vs. session-only access (blocks Phase 1)
The current model is **"no persistent membership — the code gates access each time"**
(see `docs` / domain model). Phase 1 adds a `community_members` table. Two ways to do it:

- **(Recommended) Shortcut model** — `community_members` only *remembers* which codes a
  user has entered, for UX. The **code stays the security gate**: the access RPCs keep
  validating against the community, and we re-validate on use. Lowest risk, preserves
  revocation-by-code.
- **Membership-as-gate model** — the access RPCs check `community_members` instead of the
  code. More "correct" long-term, but it's a **core security refactor** and you lose
  revoke-by-rotating-code unless you add per-member removal.

**Action:** pick one. This doc assumes the **shortcut model** unless decided otherwise.

### D2. Revocation
If membership is persisted, define how a user *loses* access (admin removes member?
code rotation? community deactivation handled already). Needed regardless of D1 choice.

### D3. Location-data compliance (blocks Phase 2)
Ride-wants store rider locations. Confirm the NDPA/PIPEDA basis, retention/auto-expiry,
and user-delete are covered by the Privacy Policy (they broadly are) before storing.

---

## Phase 0 — Health view v1 from existing data *(no new capture needed)*
Ship value before any new tables. Everything here is computable from `trips`,
`join_requests`, and the lifecycle RPCs today.

- New admin screen: **per-community health** (pick community + window).
- Metrics: active hosts, trips offered, seats offered, **match rate** (approved ÷ requests),
  **fill rate** (approved seats ÷ seats offered), completion rate, cancellation/withdraw
  rate, repeat hosts, repeat riders, week-over-week retention.
- Aggregation RPC: `admin_community_health(p_community uuid, p_window int)` — security
  definer, service-role gated, mirroring existing pattern.
- **Excluded for now:** empty-result rate, activation funnel (need Phases 1–2).

## Phase 1 — Remember community codes *(Part 3 MVP)*
Lowest-risk UX win; unlocks per-community activation funnels later.

- Table `community_members` (`user_id`, `community_id`, `joined_at`, `last_used_at`,
  unique per pair). RLS: user reads own.
- RPCs: `join_community_by_code(code)` (validate + upsert + return community),
  `get_my_communities()` (held, ordered by `last_used_at`), `leave_community(id)`.
- Main-app: on first code entry, record membership; **home-screen community switcher**
  sets the active community that Offer + Find inherit; returning users pick instead of
  retyping; re-validate on use (handle deactivated community gracefully).
- **MVP cut:** switcher + remember only. Defer Profile → Communities management UI.

## Phase 2 — Ride-wants demand capture *(Part 2 MVP)* — **before first real onboarding**
Time-sensitive: empty-result demand can't be backfilled. Highest ROI.

- Table `ride_wants` (`user_id`, `community_id`, `location_text`, `lat`, `lng`,
  `desired_window`, `seats_needed`, `status`, `created_at`, `expires_at`,
  `last_notified_at`). RLS: owner read/write; admin aggregate.
- Find empty-state → **"Notify me"** → capture want (fields mostly known from the search).
- Match engine: on `trips` INSERT, find active wants in same community within N km
  (cube/earthdistance) + overlapping window → insert `notifications` row → existing
  webhook → Edge Function → OneSignal push. Cap notifications per want (1–2) to avoid spam.
- Expiry via **`pg_cron`** (don't hand-roll): expire past `desired_window` / max age.
- Lifecycle: fulfilled on `request_to_join`; cancelled by rider; de-dupe (one active want
  per rider/community/overlapping window — upsert).
- **MVP cut:** capture + notify-on-match + expiry. Defer the rider-facing "Ride alerts"
  management screen (basic list/cancel is enough at first).

## Phase 3 — Health view v2 + liquidity status *(Part 1 full)*
Now that capture exists, complete the dashboard and the expansion gate.

- Add **empty-result rate** and **activation funnel** (signups → first ride) using
  `ride_wants` + `community_members`.
- **Liquidity label** per community (Cold / Warming / Liquid) from the trailing window —
  the expansion gate. Calibrate thresholds with real data.
- RPCs: `admin_unmet_demand(p_community, p_window)` (area clusters of unmet wants),
  extend `admin_community_health`.
- **Portfolio view** (all communities, sortable) + **time-to-first-action** on reports.

## Phase 4 — Deferred / nice-to-have
- Early-warning alerts (rising empty-result, falling match rate, host churn).
- Supply–demand **gap map** → ranked "candidate bus routes / where to seed hosts."
- Profile → Communities full management; rider Ride-alerts management.
- Materialized views / scheduled rollups if live aggregation gets heavy at scale.

---

## New schema, at a glance
| Table | Phase | Purpose |
|---|---|---|
| `community_members` | 1 | Remembered access (shortcut model) |
| `ride_wants` | 2 | Captured unmet demand + alert intent |

## New RPCs (all security-definer, service-role/auth gated to match existing pattern)
`join_community_by_code`, `get_my_communities`, `leave_community` (P1) ·
ride-want create/cancel + match trigger (P2) ·
`admin_community_health`, `admin_unmet_demand`, `admin_portfolio` (P0/P3)

## Build order rationale
Capture (Phases 1–2) must be live **before real users arrive** — you can't recover signal
you didn't record. Analytics (Phases 0/3) can follow the data; Phase 0 ships a useful
dashboard from existing tables immediately so you're not flying blind in the meantime.
