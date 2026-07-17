# Veesaa: "fine for now" list

Things we built simply on purpose. Each is acceptable at the current scale
(one community, small membership) but worth revisiting as Veesaa grows.
Grouped by area, with a rough trigger for when to act.

## Notifications & broadcasts
- **Broadcast fan-out is one row per recipient.** `sendBroadcast` inserts a
  `notifications` row for every active member, and the push webhook fires once
  per row. Fine for hundreds of users; at thousands, switch to OneSignal
  segments / a single batched push and skip the per-row webhook.
  → *Revisit when a broadcast reaches ~1k+ recipients.*
- ~~**`notifications` grows unbounded.**~~ Done (migration 0035): `prune_notifications()`
  removes read rows > 90 days and any row > 12 months, scheduled daily via pg_cron
  (enable the `pg_cron` extension in the Supabase dashboard for the schedule to run).
- ~~**No rate limiting** on reports or join requests.~~ Done (migration 0036):
  BEFORE INSERT triggers cap reports (5/hour, 20/day) and join requests (20/hour) per user.

## Admin dashboard
- **Lists are capped, not paginated.** Trips (200), reports (100), broadcasts
  (50), users/communities (all). Add pagination + search when any list gets long.
  → *Revisit when a list routinely exceeds the cap.*
- **Single admin tier.** The `admins` table is all-or-nothing, with no roles or
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
- ~~**Cloudinary unsigned upload preset.**~~ Done: uploads are now server-signed
  (`app/api/cloudinary/sign`), gated to signed-in members. Requires server env
  `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`; the old
  `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is no longer used and can be removed.
  Image moderation is still worth adding before opening registration broadly.

## Maps & geocoding
- **One Google Maps key shared by both apps**, restricted by HTTP referrer + API.
  Fine; just keep the referrer allowlist current (main app + admin origins).
- **Geocoding on trip post.** `createTrip` calls the Geocoding API when a host
  types a pickup without picking a suggestion, one call per such post. Cheap
  now; watch quota as volume grows.
- **Proximity matching scans with `earthdistance`** per query. Fine for small
  data; add a spatial index / PostGIS if community trip volume gets large.

## Secrets to rotate before production
- Cloudinary API secret
- Supabase database password
- OneSignal REST API key
(Anon/publishable key, OneSignal App ID, and the Maps key are public-by-design.)

## Deferred features (not bugs, just not built yet)
- **Email (Resend)**: transactional/marketing email not wired up.
- **Premium / paid tiers**: deferred.
- ~~**PWA icons**~~ Done: generated from the Veesaa mark into `public/icons`
  (192/512, maskable 192/512, apple-touch 180, favicons 32/16) and referenced
  from the manifest and `app/layout.tsx`.
- **Edit a posted trip**: only the review-before-post edit exists; full edit of
  a live trip is a later feature.
