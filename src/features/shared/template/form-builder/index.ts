// Components
export { FormBuilder } from "./components/form-builder";
export { FormRenderer } from "./components/form-renderer";
export { FormFieldWrapper } from "./components/form-field-wrapper";

// Hooks
export { useFormState, useValidation, useAutoSave } from "./hooks";
export type {
  UseFormStateOptions,
  UseValidationOptions,
  UseAutoSaveOptions,
} from "./hooks";

// Registry
export { registerFieldType, getFieldComponent } from "./registry";

// Types
export type {
  FieldType,
  DateRangeValue,
  LabelPlacement,
  FormLayout,
  SelectOption,
  MultiSelectOption,
  FieldIcons,
  FieldInputGroup,
  FieldUI,
  FieldRenderContext,
  FormFieldSchema,
  FormSection,
  FormSchema,
  FormBuilderProps,
} from "./types";

// Utils
export { getNestedValue, setNestedValue } from "./utils";
