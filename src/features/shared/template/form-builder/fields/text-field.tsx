'use client';

import * as React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import type { FormFieldSchema } from '../types/form-types';

export interface FieldComponentProps<T = Record<string, unknown>> {
  field: FormFieldSchema<T>;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
}

export function TextField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
  error,
}: FieldComponentProps<T>) {
  const [localValue, setLocalValue] = React.useState((value as string) ?? '');
  const isFocusedRef = React.useRef(false);
  const prevValueRef = React.useRef<unknown>(value);

  // Sync from parent only when not focused — prevents server re-syncs from
  // clobbering what the user is currently typing.
  if (prevValueRef.current !== value && !isFocusedRef.current) {
    prevValueRef.current = value;
    setLocalValue((value as string) ?? '');
  }

  const StartIcon = field.icons?.inputStartIcon;
  const EndIcon = field.icons?.inputEndIcon;

  return (
    <InputGroup>
      {(field.inputGroup?.addonStart || StartIcon) && (
        <InputGroupAddon align="inline-start">
          {StartIcon && (
            <InputGroupText>
              <StartIcon className="h-4 w-4" />
            </InputGroupText>
          )}
          {field.inputGroup?.addonStart}
        </InputGroupAddon>
      )}
      <InputGroupInput
        type={(field.props?.type as string) ?? 'text'}
        placeholder={field.placeholder}
        value={localValue}
        onChange={(e) => {
          const next = e.target.value;
          setLocalValue(next);
          prevValueRef.current = next;
          onChange(next);
        }}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        disabled={disabled || field.disabled}
        aria-invalid={!!error || undefined}
      />
      {(field.inputGroup?.addonEnd || EndIcon) && (
        <InputGroupAddon align="inline-end">
          {EndIcon && (
            <InputGroupText>
              <EndIcon className="h-4 w-4" />
            </InputGroupText>
          )}
          {field.inputGroup?.addonEnd}
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
