# Mind Extension: Pace Bars ("Ana fen fel a7mad?")

Build a new feature in Mind Extension (Next.js on Vercel, MongoDB). Pace bars compare what I've DONE with what I SHOULD have done by now (EXPECTED), so I can see how far ahead or behind I am. Before you start, look at the existing code (dashboard, the activity API routes and how they check `x-api-key`, the MongoDB setup, the UI kit) and reuse those patterns. If anything below conflicts with what's already there, tell me before you change it.

Visual reference (use it for look and behavior, don't paste its code): https://sable-cairn-6myb.here.now/
I'll attach screenshots too: home, pace page, college drill-down, the OS drawer, the drawer's correct section, and history.

## 1. Core rules (don't break these)
- Each bar has a **done** total and an **expected** total, both in the bar's unit (hours, sessions, actions...).
- **Nothing ever subtracts.** Done only goes up. Bad actions and events don't lower done, they RAISE expected, so I fall behind.
- Expected grows in two ways, and a bar can use either one or both:
  - **Schedule**: e.g. +4 per week starting from the start/commit date. The app computes this from the rule itself (from startDate up to today, Africa/Cairo time), so it still happens if nobody posts anything that day. Don't store scheduled growth as entries and don't run a cron for it.
  - **Events**: `expected` entries posted by Grok Bot or by me (e.g. a lecture happened, so OS expected goes up by 1).
- New bars start at 0/0 from their start date.
- Totals are computed from the entries (plus the schedule), never stored as editable numbers.
- Status: owed = expected minus done. Owed > 0 means BEHIND n, 0 means ON PACE, < 0 means +n AHEAD. A bar with no entries and no schedule growth yet is NEW.

## 2. Data model (MongoDB; propose the exact schema)
- **PaceGroup**: `_id`, `slug` (unique), `name`, `icon`, `unit`, `order`, `createdAt`, `archived`.
- **PaceBar**: `_id`, `slug` (unique), `name`, `icon`, `unit`, `groupId` (null means stand-alone/SOLO), `startDate`, `expectedRule`: `{ type: 'schedule' | 'events' | 'both', amount?, period?: 'day' | 'week' | 'month' }`, `order`, `createdAt`, `archived`.
- **PaceEntry** (append-only): `_id`, `barId`, `kind: 'done' | 'expected'`, `amount` (positive number, at least 1 in the UI), `note` (required), `source: 'grok' | 'ui'`, `date` (the day it counts for), `createdAt`, `voidedAt?`, `voidedBy?`.
  - Entries are never deleted or edited. "Undo" sets `voidedAt` and the entry stays in history struck through; voided entries don't count in totals.
- A group's done and expected = the sums of its children's. Children in a group share the group's unit (validate this). Group totals are never edited directly.
- Nothing is hardcoded per bar: no `api/bar/os` routes, no per-bar files or constants. Everything is data in the DB.

## 3. API (generic, data-driven)
Auth: a **new, dedicated key**, `PACE_API_KEY` (env var), sent as `x-api-key`. It's separate from `ACTIVITY_API_KEY` and only works on `/api/pace/*`. The app's own UI uses the normal logged-in session instead. Unknown or missing key returns 401. Never log the key.

Propose final shapes. Roughly:
- `GET /api/pace` returns all groups and bars with computed `done`, `expected`, `owed`, `status`, and children nested under groups. This is what Grok Bot reads every day.
- `POST /api/pace/groups` / `PATCH /api/pace/groups/:idOrSlug` creates or updates a group.
- `POST /api/pace/bars` / `PATCH /api/pace/bars/:idOrSlug` creates or updates a bar (name, unit, icon, groupId, startDate, expectedRule). Archive instead of delete.
- `GET /api/pace/bars/:idOrSlug` returns one bar with totals.
- `POST /api/pace/bars/:idOrSlug/entries` takes `{ kind, amount, note, source, date? }` and returns the new entry plus the updated totals. The body is validated (`amount > 0`, note required, kind and source from the enums). It should accept an optional `idempotencyKey` so Grok Bot can safely retry without double counting.
- `GET /api/pace/bars/:idOrSlug/entries?from=&to=` returns history, newest first, including voided entries.
- `POST /api/pace/entries/:entryId/void`: the UI may void only my own latest `ui` entry on that bar. `grok` entries can't be voided from the UI. The API key may void `grok` entries only (so Grok Bot can fix its own mistake).
- Posting to a group id returns 400 (entries go to child bars only).
Return clear JSON errors (400 with the reason, 401, 404).

## 4. Look and feel
Match the existing dark dashboard: a near-black background, with purple used only for app nav and the + button.
- **Pixel / game-HUD feel.** Numbers, status tags and small captions use a pixel font (Silkscreen via next/font, fallback JetBrains Mono). Body text stays Inter.
- Status tags are small square-bordered labels: `BEHIND n` (red #ef4444), `ON PACE` (grey), `+n AHEAD` (orange), `NEW`.
- Section captions are pixel labels with a dashed rule: GROUP, SOLO, SUBJECTS.
- No stat cards, no legend row, no filler subtitles, no rounded card walls. Use plain full-width rows with 1px dividers.
- **Boxes, never a continuous bar.** 1 box = 1 unit on every bar.
  - A row holds at most 20 boxes. Longer bars wrap onto more rows like heart containers (OS 33h = 20 + 13).
  - Boxes are 12px in rows and 14px in the drawer, with a 3px gap.
  - A done box is solid orange #f5841f with a pixel bevel (`inset 2px 2px 0 #ffb466, inset -2px -2px 0 #b5560a`) and no glow.
  - An owed box (expected minus done) has a 2px red border and red diagonal hatching.
  - A small pixel chevron arrow ends the last row, meaning the bar keeps growing.
  - Boxes added in the last 24 hours blink briefly on load (a CSS `steps()` animation; respect `prefers-reduced-motion`).
  - When done is ahead of expected, show the extra done boxes and the AHEAD tag.
- **Icon on the bar (change from the mockup):** the bar's icon sits attached to the start of the bar, touching the first box like a game-HUD avatar on its HP bar. It is not in its own column left of the label.

## 5. Screens
- **Dashboard (Home):** the pace bars section goes ABOVE the Activity chart. Keep it compact: the top 3 most-behind bars plus a "See all" link to the full pace page.
- **Pace page:** the GROUP section first, then SOLO.
  - A group row (e.g. College) is heavier: a bold, larger name, a `x4` child count, its summed boxes inside a dark pixel frame (2px #2d323a border), and a chevron. Tapping it opens a drill-down screen with lighter, thinner child rows (one per subject, under a SUBJECTS caption).
  - Stand-alone bars (Gym, Brother good actions) are normal rows in SOLO.
  - Add an easy way to create a group or a bar at any time (name, icon, unit, group, start date, expected rule).
- **Drawer (bottom sheet)**, opened by tapping any bar row:
  - A big pixel count (e.g. 26/33), the start/commit date, how expected grows (e.g. "+4 / week" or "events"), then the large box grid.
  - **CORRECT** section:
    - Two clearly separate choices: `+ Done` (I did it but it wasn't logged) and `+ Expected` (an event raised it).
    - An amount stepper. Its minus only lowers the amount about to be added, never below 1.
    - A REQUIRED note with quick-pick chips. The orange pixel button (`ADD +1 DONE` / `ADD +1 EXPECTED`) stays disabled until there's a note.
    - All tap targets are at least 44px.
    - Undo reverses only my own latest UI entry.
  - **HISTORY**: each row shows the delta (+1 done in orange, +1 expected in red), the note, a source badge (GROK or YOU), and a 12-hour timestamp like "Nov 8, 11:30 pm". Voided entries are struck through.
  - There are no +/- buttons on the rows themselves. Long-pressing a row opens the drawer with the note field focused.
- Mobile first. Use Africa/Cairo for "today" and day boundaries. Every displayed time is 12-hour am/pm, never 24-hour.

## 6. When you're done, report back
- Every endpoint's URL with an example request and response (I'll hand these to Grok Bot).
- Where to set `PACE_API_KEY` (I'll add it on Vercel myself; don't put a real key in code or commits).
- The final schema, and anything you changed from this brief and why.
