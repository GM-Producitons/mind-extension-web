"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ChatRoomProvider,
  useChatConnection,
  useMessages,
  useRoom,
  useTyping,
} from "@ably/chat/react";
import { ChatMessageEvent, ChatMessageEventType } from "@ably/chat";
import { getMessages, saveMessage } from "./api/CRUD";

// A single shared shape for rendering — covers both live Ably messages and ones loaded from the DB
interface RenderableMessage {
  serial: string;
  clientId: string;
  text: string;
  timestamp: Date;
}

// Deterministic avatar color per user, so the same person always gets the same color
const PALETTE = [
  "#7c63d8",
  "#0EA5A0",
  "#E4572E",
  "#8E6C88",
  "#2F6690",
  "#B5533C",
];
function getAvatarColor(clientId: string): string {
  let hash = 0;
  for (let i = 0; i < clientId.length; i++) {
    hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function ChatBox({ clientId }: { clientId: string }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<RenderableMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { currentStatus: connectionStatus } = useChatConnection();
  const { roomName } = useRoom();

  const { sendMessage } = useMessages({
    listener: (event: ChatMessageEvent) => {
      if (event.type === ChatMessageEventType.Created) {
        const msg: RenderableMessage = {
          serial: event.message.serial,
          clientId: event.message.clientId,
          text: event.message.text,
          timestamp: event.message.timestamp,
        };
        setMessages((prev) => [...prev, msg]);
        saveMessage({ ...msg, roomName }).catch((err) =>
          console.error("Error saving message", err),
        );
      }
    },
  });

  const { currentlyTyping, keystroke, stop } = useTyping();
  const typingUsers = Array.from(currentlyTyping).filter(
    (id) => id !== clientId,
  );

  useEffect(() => {
    let cancelled = false;
    const loadMessages = async () => {
      const history = await getMessages(roomName, 100);
      if (!cancelled) {
        setMessages(history);
        setIsLoadingHistory(false);
      }
    };
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [roomName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage({ text: inputValue.trim() }).catch((err) =>
      console.error("Error sending message", err),
    );
    stop().catch((err) => console.error("Error stopping typing", err));
    setInputValue("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim().length > 0) {
      keystroke().catch((err) => console.error("Error starting typing", err));
    } else {
      stop().catch((err) => console.error("Error stopping typing", err));
    }
  };

  return (
    <div className="mx-auto flex h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header: room name + connection status */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">
          {roomName}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-chart-1"
                : "bg-muted-foreground/40"
            }`}
          />
          <span className="text-xs capitalize text-muted-foreground">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {isLoadingHistory && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading messages...
          </div>
        )}
        {!isLoadingHistory && messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No messages yet — say hello.
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.clientId === clientId;
          const initial = msg.clientId.charAt(0).toUpperCase();
          return (
            <div
              key={msg.serial}
              className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
            >
              {!isMine && (
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getAvatarColor(msg.clientId) }}
                >
                  {initial}
                </div>
              )}
              <div
                className={`flex max-w-[70%] flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                {!isMine && (
                  <span className="mb-1 px-1 text-xs font-medium text-muted-foreground">
                    {msg.clientId}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isMine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div className="flex h-5 items-center gap-1.5 px-4 text-xs text-muted-foreground">
        {typingUsers.length > 0 && (
          <>
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" />
            </span>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing`
              : `${typingUsers.join(", ")} are typing`}
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-3">
        <input
          type="text"
          placeholder="Write a message..."
          className="flex-1 rounded-full border border-border bg-input px-4 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 12L20 4L14 20L11 13L4 12Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Chat() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUsername = async () => {
      const response = await fetch("/api/user/username");
      if (!response.ok) {
        console.error("Request failed");
        return;
      }
      const data = await response.json();
      setUsername(data.username);
    };
    loadUsername();
  }, []);

  if (!username) return null;

  return (
    <ChatRoomProvider name="chat-room">
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <ChatBox clientId={username} />
      </div>
    </ChatRoomProvider>
  );
}

export default Chat;
