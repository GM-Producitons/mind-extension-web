"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FieldComponentProps } from "./text-field";

export function RadioOptionsField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
}: FieldComponentProps<T>) {
  return (
    <RadioGroup
      value={(value as string) ?? ""}
      onValueChange={(v: string) => onChange(v)}
      disabled={disabled || field.disabled}
    >
      {field.options?.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem
            value={option.value}
            id={`${field.id}-${option.value}`}
            disabled={option.disabled}
          />
          <label
            htmlFor={`${field.id}-${option.value}`}
            className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
