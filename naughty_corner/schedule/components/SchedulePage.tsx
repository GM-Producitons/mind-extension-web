"use client";

import { useRef, useMemo, useState, useTransition } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage, isTextUIPart } from "ai";
import { Paperclip, Send, Sparkles } from "lucide-react";
import { Plus } from "lucide-react";
import type { Mission as MissionType, GeneratedDaySchedule } from "../types";
import { useMissions } from "../hooks/use-missions";
import MissionCard from "./Mission";
import DayTimeline from "./DayTimeline";
import { MissionFormDialog } from "./MissionFormDialog";
import { Button } from "@/components/ui/button";
import { generateScheduleAction } from "../apis/generate.actions";

interface DialogState {
  open: boolean;
  mode: "add" | "edit";
  mission?: MissionType;
}

function getMessageText(m: UIMessage): string {
  return (
    m.parts
      .filter(isTextUIPart)
      .map((p) => p.text)
      .join("") || ""
  );
}

export default function SchedulePage() {
  const {
    missions,
    isLoading,
    isSubmitting,
    addMission,
    updateMission,
    deleteMission,
  } = useMissions();
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    mode: "add",
  });
  const [schedule, setSchedule] = useState<GeneratedDaySchedule | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [chatInput, setChatInput] = useState("");
  const scheduleRef = useRef<GeneratedDaySchedule | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/schedule/chat",
        body: () => ({
          scheduleBlocks: scheduleRef.current?.blocks ?? [],
          dateKey: new Date().toISOString().split("T")[0],
        }),
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const openAddDialog = () => setDialogState({ open: true, mode: "add" });
  const openEditDialog = (mission: MissionType) =>
    setDialogState({ open: true, mode: "edit", mission });

  const handleDialogSubmit = async (data: {
    name: string;
    priority: number;
    deadline: Date;
  }) => {
    if (dialogState.mode === "edit" && dialogState.mission) {
      await updateMission(dialogState.mission._id, data);
    } else {
      await addMission(data);
    }
  };

  const handleGenerate = () => {
    startGenerating(async () => {
      const result = await generateScheduleAction();
      if (result.success && result.schedule) {
        setSchedule(result.schedule);
        scheduleRef.current = result.schedule;
      }
    });
  };

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || status !== "ready") return;
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sendMessage({ parts: [{ type: "text" as const, text }] });
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const isChatLoading = status === "streaming" || status === "submitted";

  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-6 sm:px-8 lg:px-12">
      {/* Top input bar */}
      <div className="mx-auto mb-6 w-full max-w-7xl space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={chatInput}
            onChange={handleTextareaChange}
            onKeyDown={handleChatKeyDown}
            placeholder="Ask anything about your schedule…"
            className="max-h-40 flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isChatLoading || !chatInput.trim()}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="space-y-1.5 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            {messages.map((m: UIMessage) => {
              const text = getMessageText(m);
              if (!text && m.role === "assistant") return null;
              return (
                <div
                  key={m.id}
                  className={`text-sm ${m.role === "user" ? "text-foreground/70" : "text-foreground"}`}
                >
                  <span className="mr-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {m.role === "user" ? "You" : "Agent"}
                  </span>
                  {text}
                </div>
              );
            })}
            {isChatLoading && (
              <p className="text-xs text-muted-foreground animate-pulse">
                Thinking…
              </p>
            )}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6">
        {/* Left column — missions */}
        <div className="flex w-120 shrink-0 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Missions
            </h2>
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleGenerate}
                disabled={isGenerating}
                title="Generate today's schedule"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={openAddDialog}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : missions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missions yet.</p>
          ) : (
            missions.map((mission) => (
              <MissionCard
                key={mission._id}
                {...mission}
                onEdit={() => openEditDialog(mission)}
                onDelete={() => deleteMission(mission._id)}
              />
            ))
          )}
        </div>

        {/* Right column — day timeline */}
        <div className="flex-1">
          <DayTimeline schedule={schedule} isGenerating={isGenerating} />
        </div>
      </div>

      <MissionFormDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
        mission={dialogState.mission}
        onSubmit={handleDialogSubmit}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
