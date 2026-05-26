"use client";

import { useRef, useState, useTransition } from "react";
import { Paperclip, Plus } from "lucide-react";
import type { Mission as MissionType } from "../types";
import { useMissions } from "../hooks/use-missions";
import MissionCard from "./Mission";
import DayTimeline from "./DayTimeline";
import { MissionFormDialog } from "./MissionFormDialog";
import { Button } from "@/components/ui/button";

interface DialogState {
  open: boolean;
  mode: "add" | "edit";
  mission?: MissionType;
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
  const [isGenerating] = useTransition();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-6 sm:px-8 lg:px-12">
      {/* Top input bar */}
      <div className="mx-auto mb-6 w-full max-w-7xl">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything about your schedule…"
            className="max-h-40 flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
          />
          <button className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Paperclip className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6">
        {/* Left column — missions */}
        <div className="flex w-120 shrink-0 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Missions
            </h2>
            <Button size="icon-sm" variant="ghost" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
            </Button>
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
          <DayTimeline schedule={null} isGenerating={isGenerating} />
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
