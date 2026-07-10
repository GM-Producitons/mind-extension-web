import { streamText, tool, convertToModelMessages, type UIMessage } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
// import { generateScheduleAction } from "@/features/schedule/apis/generate.actions";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a schedule assistant. You help the user manage their day schedule.

You have access to two tools:
1. generateFullDay — generates a complete day schedule using the multi-agent pipeline.
2. checkSlot — checks if a specific time slot is free in the current schedule.

When the user asks to generate their schedule, schedule their day, or similar → use generateFullDay.
When the user asks to schedule a specific activity at a specific time → use checkSlot first, then respond.
For general questions about their schedule, answer conversationally.

Keep responses short and direct. Respond in the same language the user writes in.`;

// export async function POST(req: Request) {
//   const body = (await req.json()) as {
//     messages: UIMessage[];
//     scheduleBlocks?: {
//       startMinute: number;
//       endMinute: number;
//       title: string;
//     }[];
//     dateKey?: string;
//   };

//   const { messages, scheduleBlocks = [], dateKey } = body;

//   const result = streamText({
//     model: groq("llama-3.3-70b-versatile"),
//     system: SYSTEM_PROMPT,
//     messages: await convertToModelMessages(messages),
//     tools: {
//       generateFullDay: tool({
//         description:
//           "Generate a complete day schedule using the multi-agent pipeline.",
//         parameters: z.object({
//           dateKey: z
//             .string()
//             .optional()
//             .describe("ISO date YYYY-MM-DD, defaults to today"),
//         }),
//         execute: async ({ dateKey: requestedDate }) => {
//           const result = await generateScheduleAction(requestedDate ?? dateKey);
//           if (!result.success || !result.schedule) {
//             return { error: result.error ?? "Failed to generate schedule" };
//           }
//           return {
//             success: true,
//             dateKey: result.schedule.dateKey,
//             blockCount: result.schedule.blocks.length,
//             schedule: result.schedule,
//           };
//         },
//       }),

//       checkSlot: tool({
//         description:
//           "Check whether a time slot is free in the current schedule.",
//         parameters: z.object({
//           startMinute: z
//             .number()
//             .describe(
//               "Start time in minutes since midnight (e.g. 780 = 13:00)",
//             ),
//           endMinute: z.number().describe("End time in minutes since midnight"),
//         }),
//         execute: async ({ startMinute, endMinute }) => {
//           const conflicts = scheduleBlocks.filter(
//             (b) => b.startMinute < endMinute && b.endMinute > startMinute,
//           );
//           if (conflicts.length === 0) {
//             return { free: true, startMinute, endMinute };
//           }
//           return {
//             free: false,
//             startMinute,
//             endMinute,
//             conflicts: conflicts.map((c) => ({
//               title: c.title,
//               startMinute: c.startMinute,
//               endMinute: c.endMinute,
//             })),
//           };
//         },
//       }),
//     },
//     maxSteps: 3,
//   });

//   return result.toUIMessageStreamResponse();
// }

export async function POST(req: Request) {
  // just a placeholder so I don't get errors while pushing to prod, will implement later
  return new Response(
    JSON.stringify({
      success: false,
      error: "This endpoint is not yet implemented.",
    }),
    { status: 501, headers: { "Content-Type": "application/json" } },
  );
}
