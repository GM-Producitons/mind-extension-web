import mongoose, { Schema, model, models } from "mongoose";

export interface ChatMessageDoc extends mongoose.Document<string> {
  roomName: string;
  clientId: string;
  text: string;
  timestamp: Date;
}

const ChatMessageSchema = new Schema<ChatMessageDoc>(
  {
    _id: { type: String, required: true },
    roomName: { type: String, required: true, index: true },
    clientId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { versionKey: false },
);

// Fast "load latest messages for a room" queries
ChatMessageSchema.index({ roomName: 1, timestamp: 1 });

export const ChatMessage =
  models.ChatMessage || model<ChatMessageDoc>("ChatMessage", ChatMessageSchema);
