"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { FieldComponentProps } from "./text-field";

export function SelectField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
  error,
}: FieldComponentProps<T>) {
  const StartIcon = field.icons?.inputStartIcon;
  const options = field.options ?? [];

  return (
    <InputGroup className={cn(error && "border-destructive ring-[3px] ring-destructive/20")}>
      {StartIcon && (
        <InputGroupAddon align="inline-start">
          <InputGroupText>
            <StartIcon className="h-4 w-4" />
          </InputGroupText>
        </InputGroupAddon>
      )}
      <Select
        value={(value as string) ?? ""}
        onValueChange={(v) => onChange(v)}
        disabled={disabled || field.disabled}
      >
        <SelectTrigger className="h-full w-full rounded-none border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder={field.placeholder ?? "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </InputGroup>
  );
}
