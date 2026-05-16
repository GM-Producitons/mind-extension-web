'use client';

import * as React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
  InputGroupText,
} from '@/components/ui/input-group';
import type { FormFieldSchema } from '../types/form-types';
import type { FieldComponentProps } from './text-field';

export function TextareaField<T extends Record<string, unknown>>({
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

  return (
    <InputGroup>
      {(field.inputGroup?.addonStart || StartIcon) && (
        <InputGroupAddon align={field.inputGroup?.addonAlign ?? 'block-start'}>
          {StartIcon && (
            <InputGroupText>
              <StartIcon className="h-4 w-4" />
            </InputGroupText>
          )}
          {field.inputGroup?.addonStart}
        </InputGroupAddon>
      )}
      <InputGroupTextarea
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
        rows={(field.props?.rows as number) ?? 3}
        aria-invalid={!!error || undefined}
      />
    </InputGroup>
  );
}
