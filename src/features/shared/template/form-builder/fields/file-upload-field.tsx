"use client";

import * as React from "react";
// import FileUploadZone from "@/features/file-upload/shared/components/file-upload-zone"; // TODO: not yet ported
import type { FieldComponentProps } from "./text-field";

export function FileUploadField<T extends Record<string, unknown>>({
  field,
}: FieldComponentProps<T>) {
  // TODO: FileUploadZone not yet ported to this project
  return (
    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      File upload not available ({field.name})
    </div>
  );
}
