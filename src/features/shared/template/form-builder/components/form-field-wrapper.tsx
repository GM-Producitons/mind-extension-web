"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import type { FormFieldSchema } from "../types/form-types";
import { getFieldComponent } from "../registry/field-registry";
import { getNestedValue } from "../utils/nested-path";

/* ─────────────────────────────────────────────── */
/*  FormFieldWrapper                               */
/* ─────────────────────────────────────────────── */

export interface FormFieldWrapperProps<T extends Record<string, unknown>> {
  field: FormFieldSchema<T>;
  value: unknown;
  onChange: (value: unknown) => void;
  formState: T;
  error?: string;
  disabled?: boolean;
}

function FormFieldWrapperInner<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  formState,
  error,
  disabled,
}: FormFieldWrapperProps<T>) {
  // Custom render
  if (field.type === "custom" && field.render) {
    return (
      <Field className={field.ui?.className}>
        {field.label && (
          <FieldLabel
            htmlFor={field.id}
            required={field.required}
            icon={
              field.icons?.labelIcon
                ? React.createElement(field.icons.labelIcon, {
                    className: "h-4 w-4",
                  })
                : undefined
            }
          >
            {field.label}
          </FieldLabel>
        )}
        {field.render({ value, onChange, formState, fieldDef: field })}
        {field.description && (
          <FieldDescription>{field.description}</FieldDescription>
        )}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  }

  const Component = getFieldComponent(field.type);

  if (!Component) {
    return (
      <Field>
        <FieldError>Unknown field type: {field.type}</FieldError>
      </Field>
    );
  }

  const isInside = field.ui?.labelPlacement === "inside";

  return (
    <Field className={field.ui?.className}>
      {/* Outside label */}
      {!isInside && field.label && (
        <FieldLabel
          htmlFor={field.id}
          required={field.required}
          icon={
            field.icons?.labelIcon
              ? React.createElement(field.icons.labelIcon, {
                  className: "h-4 w-4",
                })
              : undefined
          }
        >
          {field.label}
        </FieldLabel>
      )}

      <Component
        field={field}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
      />

      {field.description && (
        <FieldDescription>{field.description}</FieldDescription>
      )}

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

export const FormFieldWrapper = React.memo(
  FormFieldWrapperInner,
) as typeof FormFieldWrapperInner;
