import type { LucideIcon } from 'lucide-react';

/* ─────────────────────────────────────────────── */
/*  Core Schema Types                              */
/* ─────────────────────────────────────────────── */

/** Built-in field types */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'dateRange'
  | 'select'
  | 'multiSelect'
  | 'checkbox'
  | 'checkboxOptions'
  | 'radioOptions'
  | 'file'
  | 'timePicker'
  | 'custom';

/** Value type for date-range fields */
export interface DateRangeValue {
  from: Date | undefined;
  to: Date | undefined;
}

/** Where the label is positioned relative to the input */
export type LabelPlacement = 'outside' | 'inside';

/** Layout variants */
export type FormLayout = 'grid' | 'stack';

/** Select option */
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Multi-select option */
export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

/* ─────────────────────────────────────────────── */
/*  Field Icon Config                              */
/* ─────────────────────────────────────────────── */

export interface FieldIcons {
  /** Icon shown inside the label */
  labelIcon?: LucideIcon;
  /** Icon at the start (left) of the input group */
  inputStartIcon?: LucideIcon;
  /** Icon at the end (right) of the input group */
  inputEndIcon?: LucideIcon;
}

/* ─────────────────────────────────────────────── */
/*  InputGroup addon config                        */
/* ─────────────────────────────────────────────── */

export interface FieldInputGroup {
  /** Text or element at the start addon */
  addonStart?: React.ReactNode;
  /** Text or element at the end addon */
  addonEnd?: React.ReactNode;
  /** Addon alignment */
  addonAlign?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
}

/* ─────────────────────────────────────────────── */
/*  UI Config                                      */
/* ─────────────────────────────────────────────── */

export interface FieldUI {
  /** Column span in grid layout (1-12) */
  colSpan?: number;
  /** Label placement */
  labelPlacement?: LabelPlacement;
  /** Additional className on the field wrapper */
  className?: string;
}

/* ─────────────────────────────────────────────── */
/*  Render context for custom fields               */
/* ─────────────────────────────────────────────── */

export interface FieldRenderContext<T = Record<string, unknown>> {
  value: unknown;
  onChange: (value: unknown) => void;
  formState: T;
  fieldDef: FormFieldSchema<T>;
}

/* ─────────────────────────────────────────────── */
/*  Field Schema Definition                        */
/* ─────────────────────────────────────────────── */

export interface FormFieldSchema<T = Record<string, unknown>> {
  /** Unique identifier for the field */
  id: string;
  /** Field type */
  type: FieldType;
  /** Dot-path name for form state (e.g. "profile.metadata.image") */
  name: string;
  /** Label text */
  label: string;
  /** Description text shown below the field */
  description?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Default value for the field */
  defaultValue?: unknown;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** UI configuration */
  ui?: FieldUI;
  /** Icon configuration */
  icons?: FieldIcons;
  /** InputGroup addon configuration */
  inputGroup?: FieldInputGroup;
  /** Props passed to the underlying component */
  props?: Record<string, unknown>;
  /** Options for select / multiSelect */
  options?: SelectOption[];
  /** Per-field validation function */
  validation?: (value: unknown, formState: T) => string | undefined;
  /** Conditional visibility */
  visibleIf?: (formState: T) => boolean;
  /** Custom render function */
  render?: (ctx: FieldRenderContext<T>) => React.ReactNode;
}

/* ─────────────────────────────────────────────── */
/*  Form Schema                                    */
/* ─────────────────────────────────────────────── */

export interface FormSection<T = Record<string, unknown>> {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Fields in this section */
  fields: FormFieldSchema<T>[];
  /** Number of columns for this section (default: from FormBuilder) */
  columns?: number;
}

export interface FormSchema<T = Record<string, unknown>> {
  /** Array of sections, or flat array of fields */
  sections?: FormSection<T>[];
  /** Flat field list (used when no sections needed) */
  fields?: FormFieldSchema<T>[];
}

/* ─────────────────────────────────────────────── */
/*  FormBuilder Props                              */
/* ─────────────────────────────────────────────── */

export interface FormBuilderProps<T = Record<string, unknown>> {
  /** The form schema */
  schema: FormSchema<T>;
  /** Current form state (controlled) */
  values: T;
  /** Called when any field changes */
  onChange: (values: T) => void;
  /** Called on form submit */
  onSubmit?: (values: T) => void | Promise<void>;
  /** Layout variant */
  layout?: FormLayout;
  /** Number of grid columns (default: 2) */
  columns?: number;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Validation errors (field name → error message) */
  errors?: Record<string, string>;
  /** Additional className */
  className?: string;
}
