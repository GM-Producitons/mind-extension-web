"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { FormFieldSchema, FormLayout } from "../types/form-types";
import { FormFieldWrapper } from "./form-field-wrapper";
import { getNestedValue } from "../utils/nested-path";

/* ─────────────────────────────────────────────── */
/*  FormRenderer                                   */
/* ─────────────────────────────────────────────── */

export interface FormRendererProps<T extends Record<string, unknown>> {
  fields: FormFieldSchema<T>[];
  values: T;
  onChange: (name: string, value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  layout?: FormLayout;
  columns?: number;
}

export function FormRenderer<T extends Record<string, unknown>>({
  fields,
  values,
  onChange,
  errors = {},
  disabled,
  layout = "grid",
  columns = 2,
}: FormRendererProps<T>) {
  const visibleFields = fields.filter(
    (f) => !f.visibleIf || f.visibleIf(values),
  );

  if (layout === "stack") {
    return (
      <div className="grid gap-6">
        {visibleFields.map((field) => (
          <FormFieldWrapper
            key={field.id}
            field={field}
            value={getNestedValue(values, field.name)}
            onChange={(v) => onChange(field.name, v)}
            formState={values}
            error={errors[field.name]}
            disabled={disabled}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-x-4 gap-y-6"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {visibleFields.map((field) => (
        <div
          key={field.id}
          style={{
            gridColumn: field.ui?.colSpan
              ? `span ${field.ui.colSpan} / span ${field.ui.colSpan}`
              : undefined,
          }}
        >
          <FormFieldWrapper
            field={field}
            value={getNestedValue(values, field.name)}
            onChange={(v) => onChange(field.name, v)}
            formState={values}
            error={errors[field.name]}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
