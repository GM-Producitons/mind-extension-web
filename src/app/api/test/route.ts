import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("QStash called the endpoint!");

  // For now just return JSON
  return NextResponse.json({ status: "ok" });
}
