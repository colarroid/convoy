# Convoy — "fine for now" list

Things we built simply on purpose. Each is acceptable at the current scale
(one community, small membership) but worth revisiting as Convoy grows.
Grouped by area, with a rough trigger for when to act.

## Notifications & broadcasts
- **Broadcast fan-out is one row per recipient.** `sendBroadcast` inserts a
  `notifications` row for every active member, and the push webhook fires once
  per row. Fine for hundreds of users; at thousands, switch to OneSignal
  segments / a single batched push and skip the per-row webhook.
  → *Revisit when a broadcast reaches ~1k+ recipients.*
- **`notifications` grows unbounded.** No archival or cleanup. Add a retention
  policy (e.g. delete read rows older than N months) before it gets large.
- **No rate limiting** on reports or join requests — a user could spam them.
  Add per-user throttling when abuse becomes possible.

## Admin dashboard
- **Lists are capped, not paginated.** Trips (200), reports (100), broadcasts
  (50), users/communities (all). Add pagination + search when any list gets long.
  → *Revisit when a list routinely exceeds the cap.*
- **Single admin tier.** The `admins` table is all-or-nothing — no roles or
  per-community scoping. Add RBAC if you need community-level moderators or
  read-only admins.
- **Admin uses the service-role key server-side.** Correct today; keep it
  server-only and never expose it. Consider per-action audit logging at scale.

## Suspension (enforced in migration 0016)
- Suspended users are blocked from **posting, joining, and approving** at the DB
  level. They can still **sign in and browse**. At scale, consider also showing
  an in-app "account suspended" banner and/or revoking active sessions so the
  block is obvious to the user, not just silent.

## Media & uploads
- **Cloudinary unsigned upload preset.** Anyone with the preset can upload to the
  account. Fine for a trusted-community MVP; move to signed uploads (and maybe
  image moderation) before opening up registration broadly.

## Maps & geocoding
- **One Google Maps key shared by both apps**, restricted by HTTP referrer + API.
  Fine; just keep the referrer allowlist current (main app + admin origins).
- **Geocoding on trip post.** `createTrip` calls the Geocoding API when a host
  types a pickup without picking a suggestion — one call per such post. Cheap
  now; watch quota as volume grows.
- **Proximity matching scans with `earthdistance`** per query. Fine for small
  data; add a spatial index / PostGIS if community trip volume gets large.

## Secrets to rotate before production
- Cloudinary API secret
- Supabase database password
- OneSignal REST API key
(Anon/publishable key, OneSignal App ID, and the Maps key are public-by-design.)

## Deferred features (not bugs — just not built yet)
- **Email (Resend)** — transactional/marketing email not wired up.
- **Premium / paid tiers** — deferred.
- **PWA icons** — still placeholders; add real icons before production.
- **Edit a posted trip** — only the review-before-post edit exists; full edit of
  a live trip is a later feature.
