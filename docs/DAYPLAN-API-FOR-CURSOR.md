# Mind Extension × Grok Bot: DayPlan API (v1)

Hand this file to Cursor. It explains how my days work, how that maps onto the JSON, and how the app should fetch and render it.

---

## 1. The big picture

- **Grok Bot is the brain.** It knows my timetable, work, errands, missions, habits, energy, and preferences. Every evening it asks how the day went, then builds tomorrow's plan.
- **Mind Extension is the renderer.** It never plans anything. It fetches a finished **DayPlan** JSON and draws it.
- The plans are static JSON files on a fixed URL. Nothing to authenticate, and CORS is open (`*`).

```
Base URL (hardcode this):  https://karma-thicket-vj8z.here.now/api/v1/

GET index.json            → which dates exist + latest date
GET days/YYYY-MM-DD.json  → one DayPlan (404 = not planned yet)
GET latest.json           → the most recent planned day
```

The CDN caches for up to 1h, so always fetch with `cache: "no-store"` **and** a `?t=<Date.now()>` query.

---

## 2. How I think about my day (the mental model)

My week is a loop: **college → work (often until 12–1am) → home → repeat.** Sunday and Monday are usually rest days from work. Friday has Jumaa.

Inside that loop, everything on my plate is one of these:

| What I call it | What it means to me | JSON home |
|---|---|---|
| **Vision** | Long-term goals (e.g. immigration, Canada) | not in DayPlan (feeds missions) |
| **Mission** | A goal with a priority and progress %, broken into tasks | `missions[]` |
| **Task** | A concrete unit of work. Either part of a mission, standalone, or recurring. Always concrete, never "study X". | `missions[].tasks[]`, and as timeline blocks |
| **Recurring** | Standing timed obligations. **College lectures/sections/labs live here**, not in events. | `recurring[]` |
| **Mashwara / Mashawer** (errand/errands) | Something I have to go out and do. Cleared ASAP and ordered by deadline. | `mashawer[]` |
| **Event** | A real one-off: exam, appointment, Jumaa, family visit | `events[]` |
| **Habit** | Soft self-improvement that fills leftover capacity and never displaces hard stuff | timeline blocks with `type: "habit"` |
| **Buffer** | Travel, meals, prep, decompress | timeline blocks with `type: "buffer"` |
| **Drain** | How much energy something costs, not how long it takes. Each day has a budget. | `blocks[].drain`, `capacity` |
| **Cut first** | If the day overruns, these go first, in order | `cut_first[]` |

**Travel I always plan around:** home↔college 45 min, home↔work 25 min, scooter when an errand follows college.

**The timeline (`blocks[]`) is the day.** The other arrays are the *detail* behind it, shown in drawers or side panels.

---

## 3. Full example DayPlan

> Example data for a typical Sunday. Real files follow the same shape.

```json
{
  "date": "2026-10-11",
  "title": "Sunday — college · lab-items run · home",
  "sample": false,

  "blocks": [
    { "start": "09:30", "end": "09:45", "title": "Wake · leave buffer", "type": "buffer", "drain": 0, "note": "" },
    { "start": "09:45", "end": "10:30", "title": "Scooter home → college (~45m)", "type": "buffer", "drain": 1, "note": "" },
    { "start": "10:30", "end": "12:10", "title": "DSP section", "type": "recurring", "drain": 2, "note": "Pen/paper · mark ???",
      "ref": { "type": "recurring", "id": "r-dsp-sec" } },
    { "start": "12:10", "end": "12:30", "title": "Gap: annotate DSP notes + ???", "type": "task", "drain": 1, "note": "" },
    { "start": "12:30", "end": "14:10", "title": "Applied Control lecture · 353", "type": "recurring", "drain": 2, "note": "",
      "ref": { "type": "recurring", "id": "r-ctrl-lec" } },
    { "start": "14:30", "end": "16:10", "title": "Applied Control section · 137", "type": "recurring", "drain": 2, "note": "",
      "ref": { "type": "recurring", "id": "r-ctrl-sec" } },
    { "start": "16:10", "end": "16:35", "title": "Scooter college → shop", "type": "buffer", "drain": 1, "note": "Measure once" },
    { "start": "16:35", "end": "17:15", "title": "Mashwara: lab items", "type": "mashwara", "drain": 2, "note": "Bring the list",
      "ref": { "type": "mashwara", "id": "w-lab-supplies" } },
    { "start": "17:15", "end": "17:40", "title": "Scooter shop → home", "type": "buffer", "drain": 1, "note": "" },
    { "start": "18:30", "end": "19:15", "title": "Control: redo sheet 2 Q1–Q3", "type": "task", "drain": 3, "note": "Concrete piece only",
      "ref": { "type": "task", "id": "t-ctrl-sheet2" } },
    { "start": "21:00", "end": "21:15", "title": "Evening check-in with Grok Bot", "type": "habit", "drain": 0, "note": "" }
  ],

  "recurring": [
    { "id": "r-dsp-sec",  "title": "DSP section",             "start": "2026-10-11T10:30:00", "end": "2026-10-11T12:10:00", "kind": "section", "recurrence": "weekly", "location": null },
    { "id": "r-ctrl-lec", "title": "EEE4108 Control lecture", "start": "2026-10-11T12:30:00", "end": "2026-10-11T14:10:00", "kind": "lecture", "recurrence": "weekly", "location": "353" },
    { "id": "r-ctrl-sec", "title": "EEE4108 Control section", "start": "2026-10-11T14:30:00", "end": "2026-10-11T16:10:00", "kind": "section", "recurrence": "weekly", "location": "137" }
  ],

  "missions": [
    { "id": "m-control", "title": "Applied Control — stay on top", "priority": 1, "progress": 20,
      "tasks": [
        { "id": "t-ctrl-sheet2", "title": "Redo sheet 2 Q1–Q3", "status": "open", "drain_factor": 3 }
      ] }
  ],

  "mashawer": [
    { "id": "w-lab-supplies", "title": "Get lab items", "estimate_minutes": 40, "deadline": "2026-10-15",
      "status": "open", "window": { "start": "16:35", "end": "17:15" }, "route": "college → shop → home", "mode": "scooter" }
  ],

  "events": [],
  "skipped": [],

  "capacity": { "drain_budget": 10, "drain_used": 13 },
  "cut_first": ["Control sheet 2 (move to Monday)", "Gap annotation"],
  "open_questions": ["Which lab are the items for, and what's the list?"],

  "travel": { "mode_default": "scooter_when_mashawer",
              "legs_minutes": { "home_college": 45, "college_home": 45, "home_work": 25, "work_home": 25 } },
  "calendar": { "primary": "gogo05tv@gmail.com", "event_ids": {} }
}
```

`index.json`:

```json
{
  "api": "grok-bot-dayplan",
  "version": 1,
  "timezone": "Africa/Cairo",
  "updated": "2026-10-10T23:15:00+03:00",
  "days": ["2026-09-28", "2026-10-11"],
  "latest": "2026-10-11",
  "endpoints": {
    "index": "https://karma-thicket-vj8z.here.now/api/v1/index.json",
    "day": "https://karma-thicket-vj8z.here.now/api/v1/days/{date}.json",
    "latest": "https://karma-thicket-vj8z.here.now/api/v1/latest.json"
  }
}
```

---

## 4. TypeScript types

```ts
export type BlockType =
  | "recurring" | "event" | "task" | "mission" | "mashwara" | "habit" | "buffer";

export interface Block {
  start: string;            // "HH:MM", Africa/Cairo local
  end: string;              // "HH:MM"; may be past midnight-ish late work, never wraps dates
  title: string;
  type: BlockType;
  drain: number;            // 0–3 energy cost
  note?: string;
  ref?: { type: BlockType; id: string | null };   // link to detail item
}

export interface Recurring {
  id: string; title: string;
  start: string; end: string;            // local ISO, no offset, Cairo time
  kind: "lecture" | "section" | "lab" | "other";
  recurrence: string;                    // "weekly"
  location?: string | null;
}

export interface Task { id: string; title: string; status: "open" | "done" | "deferred"; drain_factor: number; }
export interface Mission { id: string; title: string; priority: number; progress: number; tasks: Task[]; }

export interface Mashwara {
  id: string; title: string; estimate_minutes: number;
  deadline?: string | null;              // "YYYY-MM-DD"
  status: "open" | "done";
  window?: { start: string; end: string };
  route?: string; mode?: string;
}

export interface CalEvent { id: string; title: string; start: string; end: string; hard: boolean; location?: string | null; }
export interface Skipped  { id: string; title: string; start: string; end: string; reason: string; }

export interface DayPlan {
  date: string;                          // "YYYY-MM-DD"
  title: string;
  blocks: Block[];                       // REQUIRED — the timeline
  sample?: boolean;
  recurring?: Recurring[];
  missions?: Mission[];
  mashawer?: Mashwara[];
  events?: CalEvent[];
  skipped?: Skipped[];
  capacity?: { drain_budget: number; drain_used: number };
  cut_first?: string[];
  open_questions?: string[];
  travel?: { mode_default?: string; legs_minutes?: Record<string, number | null>; notes?: string };
  calendar?: { primary?: string; event_ids?: Record<string, string> };
}

export interface DayIndex {
  api: string; version: 1; timezone: "Africa/Cairo"; updated: string;
  days: string[]; latest: string | null;
  endpoints: { index: string; day: string; latest: string };
}
```

**Contract:** only `date`, `title`, `blocks` are guaranteed. Treat every other field as optional, defaulting to empty. Ignore unknown fields, because new ones may be added inside v1.

---

## 5. Fetch logic

```ts
const BASE = "https://karma-thicket-vj8z.here.now/api/v1";

function cairoToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date()); // YYYY-MM-DD
}

async function getJSON<T>(path: string): Promise<T | null> {
  const r = await fetch(`${BASE}/${path}?t=${Date.now()}`, { cache: "no-store" });
  return r.ok ? r.json() : null;
}

export async function loadDay(date = cairoToday()): Promise<{ plan: DayPlan | null; isFallback: boolean }> {
  const plan = await getJSON<DayPlan>(`days/${date}.json`);
  if (plan) return { plan, isFallback: false };
  const latest = await getJSON<DayPlan>("latest.json");
  return { plan: latest, isFallback: true };   // show "not planned yet, showing <latest.date>"
}
```

Refetch on app focus, and every ~10 min while open.

---

## 6. Rendering rules (my preferences)

- **Timeline is the hero.** Draw `blocks[]` on a vertical time rail. Height is proportional to duration, and a block never clips its text.
- Colour by `type` using greys only (black background, white text, grey levels). No rainbow.
- **Yellow (blinking)** marks pending: `open_questions` exist, or a mashwara is still `open` with a near deadline.
- **Red (blinking)** marks needs attention: `drain_used > drain_budget`, or a mashwara is past its deadline. Add a tooltip explaining why.
- Tapping a block opens a **drawer** with details (resolve `ref` against `recurring`/`missions`/`mashawer`/`events`). No inline expansion.
- Show a small **drain meter** (`drain_used / drain_budget`) and the **cut-first** list near the top.
- `skipped[]` renders as struck-through ghost blocks or a small "skipped" list.
- Mobile gets its own layout with its own nav, not a shrunk desktop.
- If `isFallback`, show a quiet stamp: "Today isn't planned yet. Showing <date>."

---

## 7. Later (not built yet)

A webhook in the other direction, from the app back to Grok Bot (`task_done`, `mashwara_done`, `rebuild_day`, `feedback`). Grok Bot would update and republish, and the app would just refetch. The response body is never the plan.
