/**
 * Minimal MultiSelect component stub for form-builder.
 * Replace this with a full implementation as needed.
 */
import * as React from "react";

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, value, onChange, placeholder = "Select...", disabled }, ref) => {
    return (
      <div ref={ref} className="w-full">
        <div className="flex flex-wrap gap-1 p-2 border rounded bg-background">
          {value.length === 0 && (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
          {value.map((v) => {
            const option = options.find((o) => o.value === v);
            return (
              <div
                key={v}
                className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
              >
                {option?.label}
                <button
                  className="ml-1 hover:opacity-75"
                  onClick={() => onChange(value.filter((vv) => vv !== v))}
                  disabled={disabled}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
