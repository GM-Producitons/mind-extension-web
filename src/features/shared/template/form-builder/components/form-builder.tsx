"use client";

import * as React from "react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FormBuilderProps, FormSection } from "../types/form-types";
import { FormRenderer } from "./form-renderer";
import { setNestedValue } from "../utils/nested-path";

/* ─────────────────────────────────────────────── */
/*  FormBuilder                                    */
/* ─────────────────────────────────────────────── */

export function FormBuilder<T extends Record<string, unknown>>({
  schema,
  values,
  onChange,
  onSubmit,
  layout = "grid",
  columns = 2,
  disabled,
  errors = {},
  className,
}: FormBuilderProps<T>) {
  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      const next = setNestedValue(values, name, value) as T;
      onChange(next);
    },
    [values, onChange],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(values);
    },
    [onSubmit, values],
  );

  // Flat fields (no sections)
  if (schema.fields && !schema.sections) {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <FormRenderer
          fields={schema.fields}
          values={values}
          onChange={handleFieldChange}
          errors={errors}
          disabled={disabled}
          layout={layout}
          columns={columns}
        />
      </form>
    );
  }

  // Sectioned layout
  return (
    <form onSubmit={handleSubmit} className={cn("space-y-8", className)}>
      {schema.sections?.map((section, idx) => (
        <div key={idx} className="space-y-4">
          {section.title && (
            <div>
              <h3 className="text-base font-semibold">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              )}
              <Separator className="mt-3" />
            </div>
          )}
          <FormRenderer
            fields={section.fields}
            values={values}
            onChange={handleFieldChange}
            errors={errors}
            disabled={disabled}
            layout={layout}
            columns={section.columns ?? columns}
          />
        </div>
      ))}
    </form>
  );
}
