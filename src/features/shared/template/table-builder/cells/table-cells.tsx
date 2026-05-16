'use client';

import * as React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Upload, X, Eye, Download, Plus, Loader2 } from 'lucide-react';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/features/file-upload/shared/hooks/use-file-upload';
import {
  formatFileSize,
  isImageType,
  getFileExtension,
} from '@/features/file-upload/shared/utils/file-utils';
import type { UploadedFile } from '@/features/file-upload/shared/types/file-types';
import type { TableCellComponentProps, TableCellType } from '../types';

/* ─── Excel-style class overrides ────────────── */
const excelInputGroup =
  'border-transparent bg-transparent shadow-none ring-0 focus-within:border-transparent focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0';

/* ─────────────────────────────────────────────── */
/*  Text Cell  (multi-line)                        */
/* ─────────────────────────────────────────────── */

function TextCell({ column, value, onChange, disabled }: TableCellComponentProps) {
  const [localValue, setLocalValue] = React.useState((value as string) ?? '');
  const isFocusedRef = React.useRef(false);
  const prevValueRef = React.useRef<unknown>(value);

  // Sync from parent only when not focused — prevents server re-syncs from
  // clobbering what the user is currently typing.
  if (prevValueRef.current !== value && !isFocusedRef.current) {
    prevValueRef.current = value;
    setLocalValue((value as string) ?? '');
  }

  return (
    <InputGroup className={cn(excelInputGroup, 'h-auto')}>
      <InputGroupTextarea
        placeholder={column.placeholder}
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
        disabled={disabled || column.readOnly}
        rows={1}
        className="min-h-9 py-2 text-sm leading-snug whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere"
      />
    </InputGroup>
  );
}

/* ─────────────────────────────────────────────── */
/*  Number Cell                                    */
/* ─────────────────────────────────────────────── */

function NumberCell({ column, value, onChange, disabled }: TableCellComponentProps) {
  const toDisplay = (v: unknown) =>
    v !== undefined && v !== null && v !== '' ? String(v as number) : '';
  const [localValue, setLocalValue] = React.useState(() => toDisplay(value));
  const isFocusedRef = React.useRef(false);
  const prevValueRef = React.useRef<unknown>(value);

  // Sync from parent only when not focused.
  if (prevValueRef.current !== value && !isFocusedRef.current) {
    prevValueRef.current = value;
    setLocalValue(toDisplay(value));
  }

  return (
    <InputGroup className={excelInputGroup}>
      <InputGroupInput
        type="number"
        placeholder={column.placeholder}
        value={localValue}
        onChange={(e) => {
          const raw = e.target.value;
          const parsed = raw ? Number(raw) : '';
          setLocalValue(raw);
          prevValueRef.current = parsed;
          onChange(parsed);
        }}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
        disabled={disabled || column.readOnly}
      />
    </InputGroup>
  );
}

/* ─────────────────────────────────────────────── */
/*  Select Cell                                    */
/* ─────────────────────────────────────────────── */

function SelectCell({ column, value, onChange, disabled }: TableCellComponentProps) {
  return (
    <Select
      value={(value as string) ?? ''}
      onValueChange={(v) => onChange(v)}
      disabled={disabled || column.readOnly}
    >
      <SelectTrigger className="h-9 w-full border-transparent bg-transparent shadow-none ring-0 focus:border-transparent focus:ring-0">
        <SelectValue placeholder={column.placeholder ?? 'Select...'} />
      </SelectTrigger>
      <SelectContent>
        {column.options?.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ─────────────────────────────────────────────── */
/*  Checkbox Cell                                  */
/* ─────────────────────────────────────────────── */

function CheckboxCell({ column, value, onChange, disabled }: TableCellComponentProps) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={(value as boolean) ?? false}
        onCheckedChange={(checked) => onChange(checked)}
        disabled={disabled || column.readOnly}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  Date Cell                                      */
/* ─────────────────────────────────────────────── */

function DateCell({ column, value, onChange, disabled }: TableCellComponentProps) {
  const date = value instanceof Date ? value : value ? new Date(value as string) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <InputGroup className={excelInputGroup}>
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <CalendarIcon className="h-4 w-4" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            readOnly
            placeholder={column.placeholder ?? 'Pick date...'}
            value={date ? format(date, 'MMM d, yyyy') : ''}
            disabled={disabled || column.readOnly}
            className="cursor-pointer"
          />
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => onChange(d)} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

/* ─────────────────────────────────────────────── */
/*  File Type Icon (react-file-icon based)         */
/* ─────────────────────────────────────────────── */

function mimeToExtension(mimeType: string, fileName?: string): string {
  if (fileName) {
    const ext = getFileExtension(fileName);
    if (ext) return ext;
  }
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/csv': 'csv',
    'text/plain': 'txt',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/gzip': 'gz',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'application/json': 'json',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'image/svg+xml': 'svg',
  };
  return map[mimeType] ?? mimeType.split('/').pop()?.split('+')[0] ?? 'file';
}

function CellFileTypeIcon({
  mimeType,
  fileName,
  size = 24,
}: {
  mimeType: string;
  fileName?: string;
  size?: number;
}) {
  const ext = mimeToExtension(mimeType, fileName);
  const styleProps = defaultStyles[ext] ?? {};
  return (
    <div style={{ width: size, height: size * 1.2 }} className="shrink-0">
      <ReactFileIcon extension={ext} {...styleProps} size={size} />
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  Inline File Thumbnail                          */
/* ─────────────────────────────────────────────── */

function FileThumbnail({ file, size = 32 }: { file: UploadedFile; size?: number }) {
  if (isImageType(file.mimeType)) {
    return (
      <div
        className="shrink-0 overflow-hidden rounded-md border bg-muted"
        style={{ width: size, height: size }}
      >
        <img src={file.url} alt={file.originalName} className="h-full w-full object-cover" />
      </div>
    );
  }
  return <CellFileTypeIcon mimeType={file.mimeType} fileName={file.originalName} size={size - 8} />;
}

/* ─────────────────────────────────────────────── */
/*  File Cell                                      */
/* ─────────────────────────────────────────────── */

function FileCell({ column, value, onChange, disabled }: TableCellComponentProps) {
  const files = Array.isArray(value) ? (value as UploadedFile[]) : [];
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = React.useState<UploadedFile | null>(null);
  const isReadOnly = disabled || column.readOnly;

  const linkedModel = (column.props?.linkedModel as string) ?? 'table';
  const linkedModelId = (column.props?.linkedModelId as string) ?? 'draft';
  const purpose = (column.props?.purpose as string) ?? undefined;

  const { upload, uploadingFiles, removeFile, removeUploadingFile } = useFileUpload({
    linkedModel,
    linkedModelId,
    purpose,
    onUploadComplete: (file) => {
      onChange([...files, file]);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      upload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    await removeFile(fileId);
    onChange(files.filter((f) => f.id !== fileId));
  };

  const handlePreview = (file: UploadedFile) => {
    if (isImageType(file.mimeType)) {
      setPreviewFile(file);
    } else {
      window.open(file.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploading = uploadingFiles.filter(
    (f) => f.status === 'uploading' || f.status === 'pending',
  );

  /* ── Read-only mode ────── */
  if (isReadOnly) {
    if (files.length === 0) {
      return <span className="text-xs text-muted-foreground">No files</span>;
    }
    return (
      <>
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-wrap items-center gap-1.5 cursor-pointer">
              {files.map((file) => (
                <Tooltip key={file.id}>
                  <TooltipTrigger asChild>
                    <div className="transition-transform hover:scale-105">
                      <FileThumbnail file={file} size={32} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {file.originalName}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-2 space-y-1">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => handlePreview(file)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/60"
              >
                <FileThumbnail file={file} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{file.originalName}</p>
                  <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Download
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                />
              </button>
            ))}
          </PopoverContent>
        </Popover>
        {/* Image preview dialog */}
        <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <DialogHeader className="px-4 pt-4 pb-2">
              <DialogTitle className="text-sm font-medium truncate">
                {previewFile?.originalName}
              </DialogTitle>
            </DialogHeader>
            {previewFile && (
              <div className="relative flex items-center justify-center bg-muted/30 p-4 min-h-60">
                <img
                  src={previewFile.url}
                  alt={previewFile.originalName}
                  className="max-h-[70vh] max-w-full object-contain rounded-md"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  /* ── Edit mode: inline thumbnails + plus button, hover popover for list ── */
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={(column.props?.multiple as boolean) ?? true}
        onChange={handleInputChange}
      />

      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap items-center gap-1.5 min-h-9 px-1 py-1 cursor-pointer">
            {/* Existing file thumbnails */}
            {files.map((file) => (
              <Tooltip key={file.id}>
                <TooltipTrigger asChild>
                  <div className="transition-transform hover:scale-105">
                    <FileThumbnail file={file} size={32} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {file.originalName}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Uploading indicators */}
            {uploading.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/30">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Uploading {item.file.name}…
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Plus button to upload more */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Upload file
              </TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-80 p-2 space-y-1">
          {/* Upload area at top */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Upload className="h-3.5 w-3.5" />
            Click to upload
          </button>

          {/* Uploading progress items */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-1">
              {uploadingFiles.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 rounded-md border bg-card px-2 py-1.5"
                >
                  <CellFileTypeIcon mimeType={item.file.type} fileName={item.file.name} size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{item.file.name}</p>
                    {item.status === 'uploading' && (
                      <Progress value={item.progress} className="mt-1 h-1" />
                    )}
                    {item.status === 'error' && (
                      <p className="text-[10px] text-destructive">{item.error}</p>
                    )}
                  </div>
                  {item.status !== 'uploading' && (
                    <button
                      type="button"
                      onClick={() => removeUploadingFile(item.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Uploaded file list */}
          {files.length > 0 && (
            <div className="space-y-0.5">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group/card flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
                >
                  <FileThumbnail file={file} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{file.originalName}</p>
                    <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handlePreview(file)}
                          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Open
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleDownload(file)}
                          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Download
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Remove
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && uploadingFiles.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">No files uploaded yet</p>
          )}
        </PopoverContent>
      </Popover>

      {/* Image preview dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-sm font-medium truncate">
              {previewFile?.originalName}
            </DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="relative flex items-center justify-center bg-muted/30 p-4 min-h-60">
              <img
                src={previewFile.url}
                alt={previewFile.originalName}
                className="max-h-[70vh] max-w-full object-contain rounded-md"
              />
            </div>
          )}
          {previewFile && (
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                {previewFile.mimeType} &middot; {formatFileSize(previewFile.size)}
              </p>
              <button
                type="button"
                onClick={() => handleDownload(previewFile)}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────── */
/*  Cell Registry                                  */
/* ─────────────────────────────────────────────── */

type CellComponent = React.ComponentType<TableCellComponentProps>;

const builtInCells: Record<string, CellComponent> = {
  text: TextCell,
  number: NumberCell,
  select: SelectCell,
  checkbox: CheckboxCell,
  date: DateCell,
  file: FileCell,
};

const customCells: Record<string, CellComponent> = {};

export function registerTableCellType(type: string, component: CellComponent) {
  customCells[type] = component;
}

export function getTableCellComponent(type: TableCellType | string): CellComponent | undefined {
  return customCells[type] ?? builtInCells[type];
}
