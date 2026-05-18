"use client";

import * as React from "react";
// import { MultiSelect } from "@/features/shared/components/form/multi-select"; // TODO: not yet ported
import type { FieldComponentProps } from "./text-field";

export function MultiSelectField<T extends Record<string, unknown>>({
  field,
}: FieldComponentProps<T>) {
  // TODO: MultiSelect not yet ported to this project
  return (
    <div className="rounded-md border p-2 text-sm text-muted-foreground">
      Multi-select not available ({field.name})
    </div>
  );
}
