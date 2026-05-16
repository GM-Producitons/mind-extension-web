'use client';

import type { FieldType } from '../types/form-types';
import type { FieldComponentProps } from '../fields/text-field';
import {
  TextField,
  TextareaField,
  DateField,
  DateRangeField,
  SelectField,
  MultiSelectField,
  CheckboxField,
  CheckboxOptionsField,
  RadioOptionsField,
  FileUploadField,
  TimePickerField,
} from '../fields';

/* ─────────────────────────────────────────────── */
/*  Field Registry                                 */
/* ─────────────────────────────────────────────── */

type FieldComponent = React.ComponentType<FieldComponentProps<any>>;

const builtInRegistry: Record<string, FieldComponent> = {
  text: TextField,
  textarea: TextareaField,
  date: DateField,
  dateRange: DateRangeField,
  select: SelectField,
  multiSelect: MultiSelectField,
  checkbox: CheckboxField,
  checkboxOptions: CheckboxOptionsField,
  radioOptions: RadioOptionsField,
  file: FileUploadField,
  timePicker: TimePickerField,
};

const customRegistry: Record<string, FieldComponent> = {};

/**
 * Register a custom field type. Once registered it can be
 * referenced in any schema via `type: "yourCustomType"`.
 */
export function registerFieldType(type: string, component: FieldComponent) {
  customRegistry[type] = component;
}

/**
 * Look up the component for a given field type.
 * Custom registrations take precedence over built-ins.
 */
export function getFieldComponent(type: FieldType | string): FieldComponent | undefined {
  return customRegistry[type] ?? builtInRegistry[type];
}
