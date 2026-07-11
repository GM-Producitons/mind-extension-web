"use server";

import { connectMongoose } from "@/lib/db";
import {
  ChatMessage,
  ChatMessageDoc,
} from "@/features/shared/models/chat-message.model";

export interface ChatMessageInput {
  serial: string;
  roomName: string;
  clientId: string;
  text: string;
  timestamp: Date;
}

export interface ChatMessageResult {
  serial: string;
  roomName: string;
  clientId: string;
  text: string;
  timestamp: Date;
}

// Save a single message. Called right after Ably confirms the message was sent.
export async function saveMessage(input: ChatMessageInput): Promise<void> {
  await connectMongoose();

  const msg = await ChatMessage.updateOne(
    { _id: input.serial },
    {
      _id: input.serial,
      roomName: input.roomName,
      clientId: input.clientId,
      text: input.text,
      timestamp: input.timestamp,
    },
    { upsert: true }, // safe against retries/duplicates since _id is the Ably serial
  );
}

// Load the most recent messages for a room, oldest first (ready to render directly).
export async function getMessages(
  roomName: string,
  limit = 50,
): Promise<ChatMessageResult[]> {
  await connectMongoose();

  const docs = await ChatMessage.find({ roomName })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean<ChatMessageDoc[]>();

  return docs
    .map((doc) => ({
      serial: doc._id,
      roomName: doc.roomName,
      clientId: doc.clientId,
      text: doc.text,
      timestamp: doc.timestamp,
    }))
    .reverse(); // flip back to chronological order
}
