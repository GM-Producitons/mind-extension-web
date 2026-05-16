"use client";

import { useCallback, useRef, useState } from "react";
import { getNestedValue, setNestedValue } from "../utils/nested-path";
import type { FormFieldSchema } from "../types/form-types";

/* ─────────────────────────────────────────────── */
/*  useFormState                                   */
/* ─────────────────────────────────────────────── */

export interface UseFormStateOptions<T extends Record<string, unknown>> {
  /** Initial / default form values */
  defaultValues: T;
  /** Called whenever a value changes */
  onChange?: (values: T) => void;
}

export function useFormState<T extends Record<string, unknown>>({
  defaultValues,
  onChange,
}: UseFormStateOptions<T>) {
  const [values, setValues] = useState<T>(defaultValues);

  const getValue = useCallback(
    (path: string) => getNestedValue(values, path),
    [values],
  );

  const setValue = useCallback(
    (path: string, value: unknown) => {
      setValues((prev) => {
        const next = setNestedValue(prev, path, value) as T;
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const reset = useCallback(() => {
    setValues(defaultValues);
    onChange?.(defaultValues);
  }, [defaultValues, onChange]);

  return { values, getValue, setValue, setValues, reset };
}

/* ─────────────────────────────────────────────── */
/*  useValidation                                  */
/* ─────────────────────────────────────────────── */

export interface UseValidationOptions<T extends Record<string, unknown>> {
  fields: FormFieldSchema<T>[];
  values: T;
}

export function useValidation<T extends Record<string, unknown>>({
  fields,
  values,
}: UseValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (field: FormFieldSchema<T>): string | undefined => {
      const value = getNestedValue(values, field.name);

      // Required check
      if (field.required) {
        if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
          return `${field.label} is required`;
        }
      }

      // Custom validation
      if (field.validation) {
        return field.validation(value, values);
      }

      return undefined;
    },
    [values],
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const field of fields) {
      // Skip hidden fields
      if (field.visibleIf && !field.visibleIf(values)) continue;

      const error = validateField(field);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [fields, values, validateField]);

  const clearErrors = useCallback(() => setErrors({}), []);

  const clearFieldError = useCallback(
    (name: string) =>
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      }),
    [],
  );

  return { errors, validateField, validateAll, clearErrors, clearFieldError, setErrors };
}

/* ─────────────────────────────────────────────── */
/*  useAutoSave                                    */
/* ─────────────────────────────────────────────── */

export interface UseAutoSaveOptions<T> {
  /** Current form values */
  values: T;
  /** Save callback */
  onSave: (values: T) => void | Promise<void>;
  /** Interval in milliseconds (default: 5000) */
  interval?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
}

export function useAutoSave<T>({
  values,
  onSave,
  interval = 5000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const lastSaved = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const serialised = JSON.stringify(values);
      if (serialised !== lastSaved.current) {
        lastSaved.current = serialised;
        onSave(values);
      }
    }, interval);
  }, [values, onSave, interval]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Auto-start / stop based on enabled flag — callers can also call start/stop manually
  if (enabled && !timerRef.current) start();
  if (!enabled && timerRef.current) stop();

  return { start, stop };
}
