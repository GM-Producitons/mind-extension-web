"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldComponentProps } from "./text-field";

export function CheckboxOptionsField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
}: FieldComponentProps<T>) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

  return (
    <div className="space-y-3">
      {field.options?.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <Checkbox
            id={`${field.id}-${option.value}`}
            checked={selected.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
            disabled={disabled || field.disabled || option.disabled}
          />
          <label
            htmlFor={`${field.id}-${option.value}`}
            className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}
