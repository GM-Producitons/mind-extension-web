"use server";

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function getResponse({ text }: { text: string }) {
  try {
    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: text,
      system: "Youre a helpful assistant.",
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}
