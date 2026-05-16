"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import type { DateRangeValue } from "../types/form-types";
import type { FieldComponentProps } from "./text-field";

export function DateRangeField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
  error,
}: FieldComponentProps<T>) {
  const rangeValue = (value as DateRangeValue) ?? { from: undefined, to: undefined };

  const label = rangeValue.from
    ? rangeValue.to
      ? `${format(rangeValue.from, "LLL dd, y")} - ${format(rangeValue.to, "LLL dd, y")}`
      : format(rangeValue.from, "LLL dd, y")
    : (field.placeholder ?? "Pick a date range");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <InputGroup className={cn(error && "border-destructive ring-[3px] ring-destructive/20")}>
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <CalendarIcon className="h-4 w-4" />
            </InputGroupText>
          </InputGroupAddon>
          <Button
            variant="ghost"
            disabled={disabled || field.disabled}
            className={cn(
              "h-full w-full justify-start rounded-none border-0 bg-transparent px-3 text-sm font-normal shadow-none hover:bg-transparent",
              !rangeValue.from && "text-muted-foreground",
            )}
          >
            {label}
          </Button>
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={rangeValue.from ? { from: rangeValue.from, to: rangeValue.to } : undefined}
          onSelect={(range) =>
            onChange({ from: range?.from, to: range?.to } satisfies DateRangeValue)
          }
          numberOfMonths={2}
          disabled={disabled || field.disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
