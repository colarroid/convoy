# Veesaa — project overview

Everything you need to understand this project. Read this first.

---

## 1. What Veesaa is

Veesaa is **free community lift-sharing**. It connects people from the same
closed community who are heading to the same place at the same time, so they
ride together.

It is **not** ride-hailing. Nobody detours for anyone, nobody pays a fare, and
Veesaa is not a carrier. Legally and product-wise, Veesaa is a **coordination
platform**: it helps people who were already making the same journey find each
other. Keep this distinction, it drives the Terms, the schema, and even the
LinkedIn industry category (Software, not Transportation).

- **Brand**: Veesaa · **Domain**: veesaa.co · **Operator**: VZA Technologies Limited
- **Admin**: administrator.veesaa.co
- **Live in**: Nigeria and Canada
- **Status**: pilot / MVP
- **Contact**: hello@veesaa.co (support), privacy@veesaa.co (data requests)

### The one idea that explains everything: the community code

A community code (e.g. `THNC-SABO`) does **two jobs at once**:

1. It **proves you have access** to a closed community.
2. It **is the destination** those trips are heading to.

That is why a rider never types a destination address. It also means access is
**granted by a community admin**, not self-serve. Nearly every design decision
downstream follows from this.

### Positioning note (important)

Veesaa is a **general** shared-trip engine. The seeded community in `0001` is
*The Hope Nation Church*, but that is only the **test community**. Keep all
user-facing copy community-neutral (workplace, campus, estate, club, church),
never write as if Veesaa is a church product.

---

## 2. The two applications

| | Main app | Admin dashboard |
|---|---|---|
| Folder | `Desktop/convoy` | `Desktop/convoy-admin` |
| Package | `veesaa` | `veesaa-admin` |
| URL | veesaa.co | administrator.veesaa.co |
| Users | Members | Admins only (`admins` table) |
| Auth | Supabase Auth (email + Google) | Supabase Auth + `admins` row |
| Data access | Anon key + RLS + code-gated RPCs | **Service-role key, server-side only** |

> The folders/git remotes are still named `convoy` for historical reasons. That
> is the only place the old name survives; all identifiers, copy and assets are
> Veesaa.

**Admin creates communities. The main app only reads them via a code.** The main
app can never create a community.

---

## 3. Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind**
- **Supabase** — Postgres, Auth, RLS, security-definer RPCs, Realtime
- **Cloudinary** — images (avatars, community logos), **server-signed uploads**
- **OneSignal** — web push
- **Google Maps** — Places autocomplete + Geocoding
- **PWA** — manifest + icons + offline page

The main app is **client-rendered** (a single browser Supabase client with
localStorage sessions). There is almost no server-side code, the only route
handler is `app/api/cloudinary/sign`. Security therefore lives **in the database**,
not in the app layer. That is the single most important architectural fact here.

---

## 4. Data model

Six core tables (`supabase/migrations/0001_init.sql` + later):

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`. Name, phone, photo, DOB, `rides_completed`, `suspended`. Auto-created by the `on_auth_user_created` trigger. |
| `communities` | Created by the **admin app only**. Code, name, address, area, logo, country. |
| `trips` | A posted offer: host, community, depart date/time, pickup point (+coords), vehicle, seats, status (`open`/`full`/`completed`/`cancelled`). |
| `join_requests` | A rider asking to join a trip. `pending`/`approved`/`declined`. Unique per (trip, rider). |
| `community_members` | **A remembered-access cache, NOT the access gate.** See below. |
| `notifications` | In-app inbox; an insert fans out to push + email. |

Plus: `user_settings`, `reports`, `trip_feedback`, `experiences`, `waitlist`,
`call_requests`, `admins`, `broadcasts`.

### There are no user types

Nobody is "a driver" or "a rider". **Host vs rider is per-trip**: you host the
trip you posted and ride the trip you joined. Don't add a role column.

### `community_members` is a cache, not a gate

This one trips people up. Read the header of `0021_community_members.sql`.

- The **code is always re-validated** on use. Membership rows never grant access.
- It exists so a returning user can pick a held community instead of retyping.
- It stores the entered `code`, so **rotating a community's code revokes access**:
  stored copies stop resolving and are soft-revoked (`status='revoked'`, row kept).
- `joined_at` is the activation-funnel spine and is **never overwritten**.

> Do not turn this into the access source of truth.

---

## 5. How security works (read this before touching the DB)

Because the client talks straight to Postgres, **RLS + security-definer RPCs are
the entire security model**.

1. **RLS is deny-by-default.** `communities` has *no* select policy at all, you
   physically cannot read it from the client.
2. **Code-gated RPCs are the only way in.** `get_community_by_code(code)` and
   `get_community_trips(code)` are `security definer`, so they bypass RLS *after*
   validating the code. This is the gate.
3. **`trips` select policy** only lets you see a trip you host or have a request
   on. Browsing someone else's ride is impossible except through the code RPC.
4. **Helper functions avoid RLS recursion.** `user_hosts_trip()` /
   `user_has_request_on_trip()` are security-definer specifically so the
   `trips` ↔ `join_requests` policies don't recurse into each other.
5. **Suspension is enforced in the database** (`0016`), both in the RPCs and the
   insert policies. A suspended member can still sign in and browse but cannot
   post, join or approve.
6. **Grants are locked down** (`0018`–`0020`): `anon` and `public` have no
   EXECUTE; internal functions aren't callable over the API.
7. **Rate limits** (`0036`): BEFORE INSERT triggers cap reports (5/hour, 20/day)
   and join requests (20/hour) per user, on every path.

**Rule of thumb:** if a rule matters, enforce it in SQL. The client is not trusted.

---

## 6. The core flows

### Offer a ride (`/offer/*`)
`community` → `pickup` → `vehicle` → `datetime` → `review` → `posted`

Draft is held in `sessionStorage` (`veesaa_offer_draft`). `createTrip()` geocodes
the pickup point if the host typed it without picking a suggestion.

### Find a ride (`/find/*`)
`community` → `location` → `results` → `ride/[id]` → `requested`

`getCommunityTrips(code)` lists open rides; `0012` adds proximity matching so
rides "passing your route" surface first (`earthdistance`).

### Match
`requestToJoin(code, tripId)` → host notified → `resolveRequest(id, 'approved'|'declined')`
→ rider notified. Approval decrements `seats_open` and **shares phone numbers**
(`0006`) so the two can coordinate.

### After the ride
Past trips prompt `completeTrip()`. Completion increments `rides_completed` and
adds `distance_km` to the "kilometres shared" stat on the landing page (`0025`,
`0030`). If it didn't happen, `recordTripFeedback()` captures why (`0024`).

### Cancel / delete
`cancelTrip(id, reason?)` works on `open` **and** `full` trips, notifies **both
approved and pending** riders, and stores the reason for admins (`0033`, `0034`).
Only cancelled trips can be deleted; otherwise they disappear after departure.

---

## 7. Notifications

Insert a row into `notifications` → a webhook (`push-on-notification` edge
function) fans out to **push (OneSignal) + email**. So server code never calls
OneSignal directly, it just writes a row. Realtime (`0013`) updates the nav bell.

Retention (`0035`): read rows are pruned after 90 days, anything after 12 months,
via a daily `pg_cron` job (`veesaa-prune-notifications`, 03:15 UTC).

---

## 8. Routing and auth

`components/AuthGate.tsx` holds `PUBLIC_ROUTES`. **Anything not listed there
redirects to `/login`.** If you add a public page, add it to that set or it will
silently 302 (this has bitten us).

Public: `/`, `/about`, `/how-it-works`, `/help`, `/communities`, `/experiences`,
`/privacy`, `/terms-of-use`, and the auth pages.

Onboarding: a user without a photo is pushed to `/onboarding/photo`.
`veesaa_onboarded` in localStorage mirrors this for the gate.

---

## 9. SEO and AI discoverability

- `lib/seo.ts` — single source of truth (URL, description, socials, route lists).
- `lib/jsonLd.ts` — schema.org: `Organization` + `WebSite` + `WebApplication` +
  `Service` site-wide, `HowTo` on `/how-it-works`, `FAQPage` (30 Qs) on `/help`.
- `app/sitemap.ts` / `app/robots.ts` — robots **deliberately allows AI crawlers**
  (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) and blocks the signed-in surface.
- `public/llms.txt` — plain-language brief for AI assistants, including **when not
  to recommend Veesaa**.
- Public pages are client components, so their metadata lives in per-route
  `layout.tsx` wrappers.

Add a social profile in one place (`SOCIAL_LINKS` in `lib/seo.ts`) and it flows
to both the footer and schema `sameAs`.

---

## 10. Conventions

- **Never use an em-dash (—) anywhere in the project.** Restructure the sentence.
- British spelling in copy: neighbours, kilometre, recognise.
- Copy is community-neutral. "Free", not "no fare" (aligned across the site).
- Storage keys are `veesaa_*`. The type is `VeesaaUser`.
- Commit messages: avoid `?` and `"` (they break the PowerShell here-string used here).

---

## 11. Environment

Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
OneSignal app id, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (optional).

Server-only: `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY` (admin app only, never expose).

Migrations are **applied by hand** in the Supabase SQL editor, in order.

---

## 12. Known gaps

See `docs/SCALING.md` for the full "fine for now" list. Outstanding:

- Rotate the pre-launch secrets (Cloudinary secret, DB password, OneSignal REST key).
- Email (Resend) not fully wired.
- Editing a live posted trip isn't built (cancel and repost instead).
- Admin logo upload is signed; admin is single-tier (no RBAC).
- On Supabase Pro: custom auth domain, leaked-password protection, backups.
