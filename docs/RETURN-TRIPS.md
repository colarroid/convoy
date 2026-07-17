# Return trips (design, agreed, not yet built)

Status: **design locked, implementation not started.** One piece outstanding
(the standalone return flow, being designed separately).

---

## 1. The problem

The outbound flow works: a community code identifies the destination, members
offer and join rides to it. But **every rider carried to the destination is
stranded there by definition.** Nobody can offer a ride back. For a recurring
shared destination (a workplace, a campus, a service) the return leg is not an
edge case, it is half the journey.

## 2. The reframe

"Your code is your destination" is the product's anchor, and a return trip
breaks it: the community is now the *origin*.

The resolution: **a community code identifies the shared place.** A trip is
either **to** it or **from** it.

The actual promise was never "the code is the destination". It was **"you never
type the shared address"**, and that survives untouched:

- **Outbound**: you give your **pickup**; the community is the destination.
- **Return**: you give your **drop-off**; the community is the origin.

Either way the member never types the community's address. Only the wording of
the copy needs to change, not the promise.

## 3. Model

Add **`direction`** to `trips`: `to_community` | `from_community`.

That is close to the whole feature, because `pickup_point / pickup_lat /
pickup_lng` never really meant "pickup". It means **the member-side point**: the
end near people's homes. The community is always the other end.

- On an outbound, the member-side point is where riders are **picked up**.
- On a return, the same point is where riders are **dropped off**.

So proximity matching, seats, join requests, host approval, cancellation and
completion all work **unchanged**. Only the label flips.

## 4. Paired return (the checkbox)

The host opts in to "driving back" **while creating the outbound**, as a step in
the existing offer flow.

- The return is created **immediately, alongside the outbound**, deliberately, so
  other members can find it early.
- On opting in, the host is shown a **summary of the trip**:
  - **Date**: fixed, inherited from the outbound. Not editable.
  - **Seats**: editable. Defaults to the outbound's seats (same car).
  - **Departure time**: editable. This is when the host leaves the community.
- Everything else inherits: same vehicle, and **the outbound's pickup point
  becomes the return's drop-off point**.
- It is posted as a **separate trip**, not a leg. Seats, requests, approval and
  cancellation are all per trip, and riding only one leg is normal.

## 5. Standalone return

Anyone at the destination with a free seat can offer a return **without having
offered an outbound**. Someone who drove themselves in and has three empty seats
going home is a perfect host and must have a way in.

Because there is no outbound to inherit from, this flow needs its own
**drop-off point, date and seats**, mirroring the outbound flow.

> The detailed flow for this is being designed separately.

## 6. Riders get no privilege

Riders the host carried out **do not** get a reserved seat and are not
auto-added. They **request, and the host approves**, exactly like anyone else.
Whoever is approved rides.

Other members can find the return and request it too, including people who did
**not** ride out (they may have got there another way and still need to get home).

This is deliberate: the return adds **no new mechanics**. It is an ordinary trip.

## 7. The notification rule

Notify a rider **once, as soon as both facts are true**:

1. they are **approved on the outbound**, and
2. a **return by that host exists**.

> *"Amara is also driving back at 1pm, request a seat."*

This covers both paths, which fire at different moments:

- **Return created at checkbox time**: there are no riders yet, so the
  notification fires **when a rider is approved on the outbound**.
- **Return posted later** (standalone, or a late opt-in): riders already exist,
  so it fires **when the return is posted**.

**The notification is not tied to the pairing.** It is computed from "riders this
host carried out", so a host who skipped the checkbox and later posts a
standalone return still notifies her riders. Tying it to the pairing would mean a
forgotten checkbox silently notifies nobody.

## 8. Cancellation

The outbound and the return are **independent trips**. Cancelling the outbound
does **not** auto-cancel the return: a host who reached the destination another
way can still legitimately drive people home. The host cancels it themselves.

## 9. Ripples to handle in the same work

- **`ride_wants` needs `direction`.** Otherwise a rider searching for a way home
  is recorded as generic demand or not matched at all. Return demand is the
  demand most likely to be unmet, and the signal is non-backfillable, so this
  ships with the feature, not after it.
- **`notify_ride_wants` must match on direction**, or riders get told about rides
  going the wrong way.
- **Copy reframe** on About, How it works, `llms.txt` and the JSON-LD: the code
  is the shared place, not strictly the destination. The "never type the shared
  address" promise stays.
- **Admin**: show direction on trips and ride wants.

## 10. Open

- The standalone return flow (being designed).
- Go-ahead to build.
