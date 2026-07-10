"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocumentType } from "../types";
import { DOCUMENT_TYPE_LABELS } from "../types";

interface DocumentEditorHeaderProps {
  title: string;
  type: DocumentType;
  date: Date | undefined;
  isSaving: boolean;
  onTitleChange: (title: string) => void;
  onTypeChange: (type: DocumentType) => void;
  onDateChange: (date: Date | undefined) => void;
}

export function DocumentEditorHeader({
  title,
  type,
  date,
  isSaving,
  onTitleChange,
  onTypeChange,
  onDateChange,
}: DocumentEditorHeaderProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 border-b border-white/10 px-10 pb-5 pt-8">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled"
        className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
      />

      {/* Meta row */}
      <div className="flex items-center gap-3">
        {/* Type selector */}
        <Select
          value={type}
          onValueChange={(v) => onTypeChange(v as DocumentType)}
        >
          <SelectTrigger className="h-7 w-auto gap-1.5 border-white/10 bg-white/5 px-2.5 text-xs text-white/60 hover:bg-white/10 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-neutral-900 text-white/80">
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
              <SelectItem key={t} value={t} className="text-xs">
                {DOCUMENT_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Optional date picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 text-xs transition-colors hover:bg-white/10",
                date ? "text-white/70" : "text-white/30",
              )}
            >
              <CalendarDays size={13} />
              {date ? format(date, "MMM d, yyyy") : "Set date"}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto border-white/10 bg-neutral-900 p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                onDateChange(d);
                setCalendarOpen(false);
              }}
              initialFocus
            />
            {date && (
              <div className="border-t border-white/10 px-3 py-2">
                <button
                  onClick={() => {
                    onDateChange(undefined);
                    setCalendarOpen(false);
                  }}
                  className="text-xs text-white/40 hover:text-white/70"
                >
                  Clear date
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Auto-save indicator */}
        <span
          className={cn(
            "ml-auto text-xs transition-opacity",
            isSaving ? "text-white/40 opacity-100" : "opacity-0",
          )}
        >
          Saving…
        </span>
      </div>
    </div>
  );
}
