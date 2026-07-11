// main.tsx
"use client";
import React from "react";
import ReactDOM from "react-dom/client";
import * as Ably from "ably";
import { ChatClient, LogLevel } from "@ably/chat";
import { ChatClientProvider } from "@ably/chat/react";
import { AblyProvider } from "ably/react";
import Chat from "@/features/chat/Chat"; // Your main app component

// Create your Ably Realtime client and ChatClient instances:
const getUsername = async () => {
  const response = await fetch("/api/user/username");

  if (!response.ok) {
    console.error("Request failed");
    return;
  }

  const data = await response.json();
  return data.username;
};

const realtimeClient = new Ably.Realtime({
  key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
  clientId: await getUsername(),
});

const chatClient = new ChatClient(realtimeClient, {
  logLevel: LogLevel.Info,
});

export default function ChatPage() {
  return (
    <React.StrictMode>
      <AblyProvider client={realtimeClient}>
        <ChatClientProvider client={chatClient}>
          <Chat /> {/* Your main app component */}
        </ChatClientProvider>
      </AblyProvider>
    </React.StrictMode>
  );
}
