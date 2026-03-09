import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const now = Date.now(); // current timestamp in milliseconds

  // Fake test event 1 minute from now
  const events = [
    { title: "Test Event", time: now + 60000 }, // 60,000 ms = 1 minute
  ];

  for (const event of events) {
    // If the event is within the next 2 minutes, trigger it
    if (event.time - now < 120000) {
      console.log("SEND NOTIFICATION:", event.title);
    }
  }

  return NextResponse.json({ status: "ok" });
}
