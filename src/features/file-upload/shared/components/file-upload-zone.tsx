/**
 * Minimal FileUploadZone component stub for form-builder.
 * Replace this with a full implementation as needed.
 */
import React from "react";

interface FileUploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  disabled?: boolean;
}

const FileUploadZone = React.forwardRef<HTMLDivElement, FileUploadZoneProps>(
  ({ onFilesSelected, disabled }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full p-6 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && e.dataTransfer.files) {
            onFilesSelected?.(Array.from(e.dataTransfer.files));
          }
        }}
      >
        <input
          type="file"
          multiple
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) {
              onFilesSelected?.(Array.from(e.target.files));
            }
          }}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="text-center cursor-pointer text-sm text-muted-foreground"
        >
          <div>Drag and drop files here</div>
          <div className="text-xs">or click to select files</div>
        </label>
      </div>
    );
  },
);

FileUploadZone.displayName = "FileUploadZone";

export default FileUploadZone;
