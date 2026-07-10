import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import type {
  AgentSuggestion,
  GeneratedDaySchedule,
  ScheduledBlock,
} from "../types";
import type { RecurringTask } from "../../recurring-tasks/types";

const SYSTEM_PROMPT = `You are the Time-Related Things Agent (TRSA). You produce a complete, realistic day schedule.

Return ONLY a valid JSON object — no markdown, no code fences — in this exact shape:
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

Time rules:
- startMinute / endMinute are minutes since midnight (540 = 9:00 AM, 630 = 10:30 AM).
- Schedule between EARLIEST_START (provided per prompt) and 23:00 (1380).
- Block duration: 30–120 minutes each.
- Aim for 4–8 blocks total (excluding prayer and recurring blocks which are injected separately).
- NEVER overlap with FIXED BLOCKS listed in the prompt.

Mission rules:
- Prioritize high-priority missions with closer deadlines.
- Give more time to missions with lower completion rates.
- Leave gaps — do not fill every minute.

Freetime rules (mandatory):
- Leave at least 90 minutes total unscheduled throughout the day.
- Include at least 1 block with category "personal" for hobbies or rest.
- Do not create back-to-back blocks with no gap.

Todos suggestions:
- Incorporate the provided todo suggestions where they fit naturally.
- Do not force them if the day is already full.

category must be one of: study, work, gym, personal, meshwar, event.`;

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

interface TrsaInput {
  dateKey: string;
  earliestStartMinute: number;
  missions: {
    name: string;
    priority: number;
    deadline: string;
    completionStr: string;
  }[];
  recurringTasks: RecurringTask[];
  prayerBlocks: ScheduledBlock[];
  todoSuggestions: AgentSuggestion[];
}

export async function runTrsa(input: TrsaInput): Promise<GeneratedDaySchedule> {
  const {
    dateKey,
    earliestStartMinute,
    missions,
    recurringTasks,
    prayerBlocks,
    todoSuggestions,
  } = input;

  const allFixedBlocks: ScheduledBlock[] = [
    ...prayerBlocks,
    ...recurringTasks.map((t, i) => ({
      id: `recurring-${i}`,
      title: t.title,
      category: t.category as ScheduledBlock["category"],
      source: "recurring",
      startMinute: timeToMinutes(t.fromTime),
      endMinute: timeToMinutes(t.untilTime),
      isFixed: true,
    })),
  ];

  const missionList =
    missions.length === 0
      ? "No active missions."
      : missions
          .map(
            (m) =>
              `- ${m.name} (priority ${m.priority}/5, deadline ${m.deadline}, ${m.completionStr})`,
          )
          .join("\n");

  const fixedBlockSection =
    allFixedBlocks.length === 0
      ? ""
      : `\nFIXED BLOCKS (do NOT overlap):\n` +
        allFixedBlocks
          .map(
            (b) =>
              `- ${b.title}: ${minutesToTime(b.startMinute)}–${minutesToTime(b.endMinute)} (${b.startMinute}–${b.endMinute} min)`,
          )
          .join("\n");

  const todoSection =
    todoSuggestions.length === 0
      ? ""
      : `\nTODO SUGGESTIONS (incorporate where natural):\n` +
        todoSuggestions
          .map(
            (s) =>
              `- ${s.title} [${s.category}, ~${s.durationMinutes} min, ${s.priority} priority]` +
              (s.note ? ` — ${s.note}` : ""),
          )
          .join("\n");

  const prompt =
    `Date: ${dateKey}\n` +
    `EARLIEST_START: ${minutesToTime(earliestStartMinute)} (minute ${earliestStartMinute})\n\n` +
    `Missions:\n${missionList}` +
    fixedBlockSection +
    todoSection +
    `\n\nGenerate a day schedule.`;

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    prompt,
  });

  let result: GeneratedDaySchedule;
  try {
    result = JSON.parse(text) as GeneratedDaySchedule;
    if (!Array.isArray(result.blocks)) throw new Error("invalid shape");
  } catch {
    result = {
      dateKey,
      blocks: [],
      dangerSlots: [],
      conflicts: [
        {
          id: "parse-error",
          message: "Failed to parse AI response",
          severity: "error",
        },
      ],
    };
  }

  // Remove any AI-generated blocks that overlap with fixed blocks
  result.blocks = result.blocks.filter(
    (block) => !allFixedBlocks.some((fb) => overlaps(block, fb)),
  );

  // Inject fixed blocks and sort
  result.blocks = [...allFixedBlocks, ...result.blocks].sort(
    (a, b) => a.startMinute - b.startMinute,
  );

  return result;
}
