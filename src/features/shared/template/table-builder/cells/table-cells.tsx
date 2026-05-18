"use client";

import * as React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
// import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon'; // TODO: not yet ported
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// import { useFileUpload } from '@/features/file-upload/shared/hooks/use-file-upload'; // TODO: not yet ported
// import { formatFileSize, isImageType, getFileExtension } from '@/features/file-upload/shared/utils/file-utils'; // TODO: not yet ported
// import type { UploadedFile } from '@/features/file-upload/shared/types/file-types'; // TODO: not yet ported
import type { TableCellComponentProps, TableCellType } from "../types";

/* ─── Excel-style class overrides ────────────── */
const excelInputGroup =
  "border-transparent bg-transparent shadow-none ring-0 focus-within:border-transparent focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0";

/* ─────────────────────────────────────────────── */
/*  Text Cell  (multi-line)                        */
/* ─────────────────────────────────────────────── */

function TextCell({
  column,
  value,
  onChange,
  disabled,
}: TableCellComponentProps) {
  const [localValue, setLocalValue] = React.useState((value as string) ?? "");
  const isFocusedRef = React.useRef(false);
  const prevValueRef = React.useRef<unknown>(value);

  if (prevValueRef.current !== value && !isFocusedRef.current) {
    prevValueRef.current = value;
    setLocalValue((value as string) ?? "");
  }

  return (
    <InputGroup className={cn(excelInputGroup, "h-auto")}>
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

function NumberCell({
  column,
  value,
  onChange,
  disabled,
}: TableCellComponentProps) {
  const toDisplay = (v: unknown) =>
    v !== undefined && v !== null && v !== "" ? String(v as number) : "";
  const [localValue, setLocalValue] = React.useState(() => toDisplay(value));
  const isFocusedRef = React.useRef(false);
  const prevValueRef = React.useRef<unknown>(value);

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
          const parsed = raw ? Number(raw) : "";
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

function SelectCell({
  column,
  value,
  onChange,
  disabled,
}: TableCellComponentProps) {
  return (
    <Select
      value={(value as string) ?? ""}
      onValueChange={(v) => onChange(v)}
      disabled={disabled || column.readOnly}
    >
      <SelectTrigger className="h-9 w-full border-transparent bg-transparent shadow-none ring-0 focus:border-transparent focus:ring-0">
        <SelectValue placeholder={column.placeholder ?? "Select..."} />
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

function CheckboxCell({
  column,
  value,
  onChange,
  disabled,
}: TableCellComponentProps) {
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

function DateCell({
  column,
  value,
  onChange,
  disabled,
}: TableCellComponentProps) {
  const date =
    value instanceof Date
      ? value
      : value
        ? new Date(value as string)
        : undefined;

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
            placeholder={column.placeholder ?? "Pick date..."}
            value={date ? format(date, "MMM d, yyyy") : ""}
            disabled={disabled || column.readOnly}
            className="cursor-pointer"
          />
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// TODO: FileThumbnail and FileCell removed - depend on react-file-icon and
// file-upload utilities not yet ported to this project.
// function FileThumbnail(...) { ... }
// function FileCell(...) { ... }

// Suppress unused import warnings for Dialog/Popover used only in removed cells
void (Dialog as unknown);
void (DialogContent as unknown);
void (DialogHeader as unknown);
void (DialogTitle as unknown);

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
  // file: FileCell, // TODO: not yet ported
};

const customCells: Record<string, CellComponent> = {};

export function registerTableCellType(type: string, component: CellComponent) {
  customCells[type] = component;
}

export function getTableCellComponent(
  type: TableCellType | string,
): CellComponent | undefined {
  return customCells[type] ?? builtInCells[type];
}
