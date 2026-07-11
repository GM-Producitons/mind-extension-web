"use client";
import React, { useEffect, useState } from "react";
import * as Ably from "ably";
import { ChatClient, LogLevel } from "@ably/chat";
import { ChatClientProvider } from "@ably/chat/react";
import { AblyProvider } from "ably/react";
import Chat from "@/features/chat/Chat";

export default function ChatPage() {
  const [clients, setClients] = useState<{
    realtimeClient: Ably.Realtime;
    chatClient: ChatClient;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      const response = await fetch("/api/user/username");
      if (!response.ok) {
        console.error("Request failed");
        return;
      }
      const data = await response.json();

      const realtimeClient = new Ably.Realtime({
        key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
        clientId: data.username,
      });
      const chatClient = new ChatClient(realtimeClient, {
        logLevel: LogLevel.Info,
      });

      if (!cancelled) {
        setClients({ realtimeClient, chatClient });
      }
    };

    setup();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!clients) return null;

  return (
    <AblyProvider client={clients.realtimeClient}>
      <ChatClientProvider client={clients.chatClient}>
        <Chat />
      </ChatClientProvider>
    </AblyProvider>
  );
}
