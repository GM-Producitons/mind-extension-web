"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldComponentProps } from "./text-field";

export function CheckboxField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
}: FieldComponentProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={field.id}
        checked={(value as boolean) ?? false}
        onCheckedChange={(checked) => onChange(checked)}
        disabled={disabled || field.disabled}
      />
      {field.placeholder && (
        <label
          htmlFor={field.id}
          className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {field.placeholder}
        </label>
      )}
    </div>
  );
}
