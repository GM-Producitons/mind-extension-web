"use server";

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { getMissionRecords } from "../../../../repositories/schedule.repository";
import { getRecurringTaskRecordsForDay } from "../../recurring-tasks/lib/recurring-task.repository";
import { getDB } from "@/lib/db";
import type { RecurringTask, WeekDay } from "../../recurring-tasks/types";

const SYSTEM_PROMPT = `You are a schedule planner AI. Given a list of missions and a date, generate a focused day schedule.

Return ONLY a valid JSON object — no markdown, no code fences, no explanation — in this exact shape:
{
  "dateKey": "YYYY-MM-DD",
  "blocks": [
    {
      "id": "1",
      "title": "Task title",
      "category": "study",
      "source": "generated",
      "startMinute": 540,
      "endMinute": 660,
      "isFixed": false
    }
  ],
  "dangerSlots": [],
  "conflicts": []
}

Rules:
- startMinute / endMinute are minutes since midnight (e.g. 9:00 AM = 540, 10:30 AM = 630).
- Schedule between EARLIEST_START (provided in the prompt) and 23:00 (1380). Never schedule before EARLIEST_START.
- Prioritize high-priority missions with closer deadlines.
- Missions with lower completion rate need more time — allocate more blocks to them.
- Leave gaps between blocks — do not fill every minute.
- Block duration: 30–120 minutes each.
- category must be one of: study, work, gym, personal, meshwar, event.
- Aim for 4–8 blocks total.
- NEVER overlap with any BLOCKED time slots listed in the prompt.`;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function overlaps(
  a: { startMinute: number; endMinute: number },
  b: { startMinute: number; endMinute: number },
): boolean {
  return a.startMinute < b.endMinute && a.endMinute > b.startMinute;
}

/**
 * Generate a day schedule using AI.
 * @param dateKey - ISO date string "YYYY-MM-DD". Defaults to today.
 */
export async function generateScheduleAction(dateKey?: string) {
  try {
    const allMissions = await getMissionRecords();
    const targetDate = dateKey ?? new Date().toISOString().split("T")[0];

    // ── 1. Filter out missions whose deadline has already passed ──────────
    const targetDateObj = new Date(targetDate + "T00:00:00");
    const missions = allMissions.filter(
      (m) => new Date(m.deadline) >= targetDateObj,
    );

    // ── 2. Fetch completion stats from todos collection ───────────────────
    const db = await getDB();
    type CompletionStat = { total: number; completed: number };
    const completionMap: Record<string, CompletionStat> = {};
    if (missions.length > 0) {
      const missionIds = missions.map((m) => m._id.toString());
      const stats = await db
        .collection("todos")
        .aggregate([
          { $match: { missionId: { $in: missionIds } } },
          {
            $group: {
              _id: "$missionId",
              total: { $sum: 1 },
              completed: { $sum: { $cond: ["$completed", 1, 0] } },
            },
          },
        ])
        .toArray();
      for (const s of stats) {
        completionMap[s._id as string] = {
          total: s.total as number,
          completed: s.completed as number,
        };
      }
    }

    // ── 3. Determine earliest start minute ────────────────────────────────
    const todayKey = new Date().toISOString().split("T")[0];
    const isToday = targetDate === todayKey;
    let earliestStartMinute = 360; // 06:00 default
    if (isToday) {
      const now = new Date();
      const rawMinute = now.getHours() * 60 + now.getMinutes();
      // Round up to nearest 15-min slot so the first block is never in the past
      earliestStartMinute = Math.ceil(rawMinute / 15) * 15;
    }

    // ── Determine day of week for the target date (0=Sun … 6=Sat) ─────────
    const dayOfWeek = new Date(targetDate + "T12:00:00").getDay() as WeekDay;
    const recurringTasks: RecurringTask[] =
      await getRecurringTaskRecordsForDay(dayOfWeek);

    const missionList =
      missions.length === 0
        ? "No active missions (all deadlines have passed)."
        : missions
            .map((m) => {
              const stats = completionMap[m._id.toString()];
              const completionStr = stats
                ? `${stats.completed}/${stats.total} tasks done`
                : "no tasks tracked yet";
              return `- ${m.name} (priority ${m.priority}/5, deadline ${new Date(m.deadline).toLocaleDateString("en-CA")}, ${completionStr})`;
            })
            .join("\n");

    const blockedSlotSection =
      recurringTasks.length === 0
        ? ""
        : `\nBLOCKED time slots (already committed — do NOT schedule anything overlapping these):\n` +
          recurringTasks
            .map(
              (t) =>
                `- ${t.title}: ${t.fromTime}–${t.untilTime} ` +
                `(startMinute ${timeToMinutes(t.fromTime)}, endMinute ${timeToMinutes(t.untilTime)})`,
            )
            .join("\n");

    const prompt =
      `The date to schedule is ${targetDate}.\n` +
      `EARLIEST_START: ${minutesToTime(earliestStartMinute)} (minute ${earliestStartMinute}).\n\n` +
      `My missions:\n${missionList}` +
      blockedSlotSection +
      `\n\nGenerate a day schedule that helps me make progress on these missions.`;

    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      prompt,
    });

    // ── Post-process: enforce recurring task blocks are respected ──────────
    const fixedBlocks = recurringTasks.map((t, i) => ({
      id: `fixed-${i}`,
      title: t.title,
      category: t.category as string,
      source: "recurring",
      startMinute: timeToMinutes(t.fromTime),
      endMinute: timeToMinutes(t.untilTime),
      isFixed: true,
    }));

    let finalJson = response.text;
    try {
      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed.blocks) && fixedBlocks.length > 0) {
        // Remove any AI block that overlaps with a fixed recurring block
        parsed.blocks = parsed.blocks.filter(
          (block: { startMinute: number; endMinute: number }) =>
            !fixedBlocks.some((fb) => overlaps(block, fb)),
        );
        // Inject fixed blocks and sort by start time
        parsed.blocks = [...fixedBlocks, ...parsed.blocks].sort(
          (a, b) => a.startMinute - b.startMinute,
        );
        finalJson = JSON.stringify(parsed, null, 2);
      }
    } catch {
      // If parsing fails, return raw AI text and let the client handle it
    }

    return { success: true, json: finalJson };
  } catch (error) {
    console.error("Error generating schedule:", error);
    return { success: false, json: "", error: "Failed to generate schedule" };
  }
}
