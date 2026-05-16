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
import type { FieldComponentProps } from "./text-field";

export function DateField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
  error,
}: FieldComponentProps<T>) {
  const dateValue = value instanceof Date ? value : value ? new Date(value as string) : undefined;
  const StartIcon = field.icons?.inputStartIcon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <InputGroup className={cn(error && "border-destructive ring-[3px] ring-destructive/20")}>
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              {StartIcon ? <StartIcon className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
            </InputGroupText>
          </InputGroupAddon>
          <Button
            variant="ghost"
            disabled={disabled || field.disabled}
            className={cn(
              "h-full w-full justify-start rounded-none border-0 bg-transparent px-3 text-sm font-normal shadow-none hover:bg-transparent",
              !dateValue && "text-muted-foreground",
            )}
          >
            {dateValue ? format(dateValue, "PPP") : (field.placeholder ?? "Pick a date")}
          </Button>
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(day) => onChange(day)}
          disabled={disabled || field.disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
