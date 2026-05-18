"use server";

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { getMissionRecords } from "../../../../repositories/schedule.repository";
import { getRecurringTaskRecordsForDay } from "../../recurring-tasks/lib/recurring-task.repository";
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
- Schedule between 06:00 (360) and 23:00 (1380).
- Prioritize high-priority missions with closer deadlines.
- Leave gaps between blocks — do not fill every minute.
- Block duration: 30–120 minutes each.
- category must be one of: study, work, gym, personal, meshwar, event.
- Aim for 4–8 blocks total.
- NEVER overlap with any BLOCKED time slots listed in the prompt.`;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
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
    const missions = await getMissionRecords();
    const targetDate = dateKey ?? new Date().toISOString().split("T")[0];

    // Determine day of week for the target date (0=Sun … 6=Sat)
    const dayOfWeek = new Date(targetDate + "T12:00:00").getDay() as WeekDay;
    const recurringTasks: RecurringTask[] =
      await getRecurringTaskRecordsForDay(dayOfWeek);
    console.log(recurringTasks);
    const missionList =
      missions.length === 0
        ? "No missions defined yet."
        : missions
            .map(
              (m) =>
                `- ${m.name} (priority ${m.priority}/5, deadline ${new Date(m.deadline).toLocaleDateString("en-CA")})`,
            )
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
      `The date to schedule is ${targetDate}.\n\nMy missions:\n${missionList}` +
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
