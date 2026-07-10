"use server";

import { getMissionRecords } from "../../../../repositories/schedule.repository";
import { getRecurringTaskRecordsForDay } from "../../recurring-tasks/lib/recurring-task.repository";
import { getDB } from "@/lib/db";
import { getPrayerBlocks } from "@/lib/prayer-times";
import { getMe } from "@/features/apis/user";
import { runTodosAgent } from "../agents/todos.agent";
import { runTrsa } from "../agents/trsa.agent";
import type { WeekDay } from "../../recurring-tasks/types";
import type { GeneratedDaySchedule } from "../types";

/**
 * Orchestrates the full multi-agent schedule generation pipeline:
 *   1. Pre-fetch: missions, recurring tasks, prayer blocks, todos (no LLM)
 *   2. Todos Agent (LLM): reasons about which todos need schedule blocks
 *   3. TRSA (LLM): generates the final schedule from all context
 */
export async function generateScheduleAction(dateKey?: string): Promise<{
  success: boolean;
  schedule: GeneratedDaySchedule | null;
  error?: string;
}> {
  try {
    const targetDate = dateKey ?? new Date().toISOString().split("T")[0];
    const targetDateObj = new Date(`${targetDate}T00:00:00`);

    // ── 1. Pre-fetch missions + user (parallel) ───────────────────────────
    const [allMissions, me] = await Promise.all([getMissionRecords(), getMe()]);
    const utcOffsetMinutes: number = (me?.utcOffset ?? 0) * 60;
    const missions = allMissions.filter(
      (m) => new Date(m.deadline) >= targetDateObj,
    );

    // ── 2. Completion stats ───────────────────────────────────────────────
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

    // ── 3. Earliest start minute ──────────────────────────────────────────
    const todayKey = new Date().toISOString().split("T")[0];
    let earliestStartMinute = 360; // 06:00 default
    if (targetDate === todayKey) {
      const now = new Date();
      const rawMinute = now.getHours() * 60 + now.getMinutes();
      earliestStartMinute = Math.ceil(rawMinute / 15) * 15;
    }

    // ── 4. Recurring tasks + prayer blocks (parallel) ─────────────────────
    const dayOfWeek = new Date(`${targetDate}T12:00:00`).getDay() as WeekDay;
    const [recurringTasks] = await Promise.all([
      getRecurringTaskRecordsForDay(dayOfWeek),
    ]);
    const prayerBlocks = getPrayerBlocks(targetDate, utcOffsetMinutes);

    // ── 5. Mission summaries ──────────────────────────────────────────────
    const missionSummaries = missions.map((m) => {
      const stats = completionMap[m._id.toString()];
      const completionStr = stats
        ? `${stats.completed}/${stats.total} tasks done`
        : "no tasks tracked yet";
      return {
        name: m.name,
        priority: m.priority,
        deadline: new Date(m.deadline).toLocaleDateString("en-CA"),
        completionStr,
      };
    });

    // ── 6. Todos Agent ────────────────────────────────────────────────────
    const todoSuggestions = await runTodosAgent(targetDate);

    // ── 7. TRSA ───────────────────────────────────────────────────────────
    const schedule = await runTrsa({
      dateKey: targetDate,
      earliestStartMinute,
      missions: missionSummaries,
      recurringTasks,
      prayerBlocks,
      todoSuggestions,
    });

    return { success: true, schedule };
  } catch (error) {
    console.error("Error generating schedule:", error);
    return {
      success: false,
      schedule: null,
      error: "Failed to generate schedule",
    };
  }
}
