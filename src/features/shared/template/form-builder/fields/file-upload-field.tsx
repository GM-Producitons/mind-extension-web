"use client";

import * as React from "react";
import FileUploadZone from "@/features/file-upload/shared/components/file-upload-zone";
import type { FieldComponentProps } from "./text-field";

export function FileUploadField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
}: FieldComponentProps<T>) {
  const linkedModel = (field.props?.linkedModel as string) ?? "form";
  const linkedModelId = (field.props?.linkedModelId as string) ?? field.id;
  const multiple = (field.props?.multiple as boolean) ?? true;
  const compact = (field.props?.compact as boolean) ?? false;
  const preview = (field.props?.preview as boolean) ?? true;
  const download = (field.props?.download as boolean) ?? true;

  return (
    <FileUploadZone
      linkedModel={linkedModel}
      linkedModelId={linkedModelId}
      purpose={field.name}
      multiple={multiple}
      compact={compact}
      preview={preview}
      download={download}
      validation={field.props?.validation as Record<string, unknown> | undefined}
      onUploadComplete={(file) => {
        if (multiple) {
          const current = Array.isArray(value) ? value : [];
          onChange([...current, file]);
        } else {
          onChange(file);
        }
      }}
      onFilesChange={(files) => {
        if (multiple) {
          onChange(files);
        } else {
          onChange(files[0] ?? null);
        }
      }}
    />
  );
}
