"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerInput } from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateEndTime } from "./utils";
import { Textarea } from "@/components/ui/textarea";

interface TodoFormProps {
  title: string;
  setTitle: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  fromTime: string;
  setFromTime: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  showCancel?: boolean;
}

const DURATION_OPTIONS = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
];

export const TodoForm = ({
  title,
  setTitle,
  date,
  setDate,
  fromTime,
  setFromTime,
  duration,
  setDuration,
  onSubmit,
  isLoading = false,
  submitLabel = "Add to do",
  onCancel,
  showCancel = false,
}: TodoFormProps) => {
  const endTime = calculateEndTime(fromTime, duration);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Title
        </label>
        <Textarea
          placeholder="Enter todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Date
        </label>
        <DatePickerInput
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Start Time
          </label>
          <Input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Duration
          </label>
          <Select
            value={duration.toString()}
            onValueChange={(v) => setDuration(parseInt(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="bg-muted p-3 rounded-lg">
        <p className="text-sm text-muted-foreground">
          End time:{" "}
          <span className="font-semibold text-foreground">{endTime}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={!title.trim() || isLoading}
          className="flex-1"
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
        {showCancel && (
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
