"use client";

import * as React from "react";
import { MultiSelect } from "@/features/shared/components/form/multi-select";
import type { FieldComponentProps } from "./text-field";

export function MultiSelectField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
}: FieldComponentProps<T>) {
  const options = (field.options ?? []).map((o) => ({
    value: o.value,
    label: o.label,
  }));

  return (
    <MultiSelect
      options={options}
      selectedValues={(value as string[]) ?? []}
      onSelectionChange={(v) => onChange(v)}
      placeholder={field.placeholder ?? "Select..."}
      disabled={disabled || field.disabled}
    />
  );
}
