import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { getDB } from "@/lib/db";
import type { AgentSuggestion } from "../types";

const SYSTEM_PROMPT = `You are the Todos Agent. You receive a list of today's pending tasks (htbasas todos).
Your job: decide which tasks genuinely need a dedicated time block in today's schedule.

Return ONLY a valid JSON array of suggestions — no markdown, no code fences:
[
  {
    "title": "Task title",
    "category": "study",
    "durationMinutes": 30,
    "priority": "high",
    "note": "optional short reason"
  }
]

Rules:
- category must be one of: study, work, gym, personal, meshwar, event
- durationMinutes: 15–90 minutes
- priority: "high" | "medium" | "low"
- Skip tasks that are already clearly quick errands (< 5 min) unless they are time-sensitive
- Skip completed tasks
- Return an empty array [] if no todos need dedicated blocks
- Return at most 4 suggestions`;

interface RawTodo {
  _id: { toString(): string };
  title: string;
  fromTime: string;
  untilTime: string;
  completed: boolean;
}

/**
 * Runs the Todos Agent for a given date.
 * Fetches today's uncompleted htbasas todos and asks the LLM
 * which ones need dedicated schedule blocks.
 */
export async function runTodosAgent(
  dateKey: string,
): Promise<AgentSuggestion[]> {
  const db = await getDB();
  const dayStart = new Date(`${dateKey}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateKey}T23:59:59.999Z`);

  const todos = (await db
    .collection("todos")
    .find({ date: { $gte: dayStart, $lte: dayEnd }, completed: false })
    .toArray()) as RawTodo[];

  if (todos.length === 0) return [];

  const todoList = todos
    .map((t) => `- ${t.title} (${t.fromTime}–${t.untilTime})`)
    .join("\n");

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    prompt: `Today is ${dateKey}. My pending tasks:\n${todoList}`,
  });

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as AgentSuggestion[];
    return [];
  } catch {
    return [];
  }
}
