'use client';

import * as React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { TableBuilderProps, TableRow as TRow, TableColumnSchema } from '../types';
import { getTableCellComponent } from '../cells';

/* ─────────────────────────────────────────────── */
/*  Memoised Cell                                  */
/* ─────────────────────────────────────────────── */

const MemoCell = React.memo(function MemoCell({
  column,
  row,
  onChange,
  disabled,
  error,
}: {
  column: TableColumnSchema;
  row: TRow;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
}) {
  // Allow a column-level render override for any cell type.
  // Returning `undefined` falls back to the built-in cell implementation.
  if (column.render) {
    const rendered = column.render({ row, column, value: row[column.id], onChange, rowIndex: 0 });
    if (rendered !== undefined) {
      return <>{rendered}</>;
    }
  }

  // Support per-row linkedModelId resolution via linkedModelIdKey prop.
  // When set, the file cell uses row[linkedModelIdKey] as the linkedModelId
  // instead of the static value in column.props — this is what links uploaded
  // files to individual rows rather than to the parent entity.
  let effectiveColumn = column;
  if (column.props?.linkedModelIdKey) {
    const key = column.props.linkedModelIdKey as string;
    effectiveColumn = {
      ...column,
      props: {
        ...column.props,
        linkedModelId: (row[key] as string) ?? (column.props.linkedModelId as string),
      },
    };
  }

  const Component = getTableCellComponent(effectiveColumn.type);

  if (!Component) {
    return <span className="text-xs text-destructive">Unknown: {column.type}</span>;
  }

  return (
    <div>
      <Component
        column={effectiveColumn}
        value={row[column.id]}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
});

/* ─────────────────────────────────────────────── */
/*  Memoised Row                                   */
/* ─────────────────────────────────────────────── */

const MemoRow = React.memo(function MemoRow({
  row,
  columns,
  onCellChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  deletable,
  rowReorder,
  isFirst,
  isLast,
  disabled,
  errors,
}: {
  row: TRow;
  columns: TableColumnSchema[];
  onCellChange: (rowId: string, columnId: string, value: unknown) => void;
  onDelete?: (rowId: string) => void;
  onMoveUp?: (rowId: string) => void;
  onMoveDown?: (rowId: string) => void;
  deletable?: boolean;
  rowReorder?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  errors?: Record<string, string>;
}) {
  const hasActions = deletable || rowReorder;

  return (
    <TableRow className="align-top">
      {columns.map((col) => (
        <TableCell key={col.id} style={{ minWidth: col.minWidth ?? 120 }} className="py-1.5 px-2">
          <MemoCell
            column={col}
            row={row}
            onChange={(value) => onCellChange(row._id, col.id, value)}
            disabled={disabled}
            error={errors?.[col.id]}
          />
        </TableCell>
      ))}
      {hasActions && (
        <TableCell className="py-1.5 px-1 w-20">
          <div className="flex items-center gap-0.5">
            {rowReorder && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => onMoveUp?.(row._id)}
                      disabled={disabled || isFirst}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Move up
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => onMoveDown?.(row._id)}
                      disabled={disabled || isLast}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Move down
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {deletable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete?.(row._id)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  Delete row
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
});

/* ─────────────────────────────────────────────── */
/*  Auto-increment helper                          */
/* ─────────────────────────────────────────────── */

function isRowEmpty(row: TRow, columns: TableColumnSchema[]): boolean {
  return columns.every((col) => {
    const v = row[col.id];
    if (v === undefined || v === null || v === '') return true;
    if (Array.isArray(v) && v.length === 0) return true;
    if (v === false && col.type === 'checkbox') return true;
    return false;
  });
}

/* ─────────────────────────────────────────────── */
/*  TableBuilder                                   */
/* ─────────────────────────────────────────────── */

export function TableBuilder({
  schema,
  rows,
  onChange,
  addable = true,
  deletable = true,
  disabled = false,
  className,
  addLabel = 'Add Row',
  maxRows = 0,
  errors,
  autoIncrement = false,
  rowReorder = false,
}: TableBuilderProps) {
  const { columns } = schema;

  // Stable ref so useCallback handlers don't need `rows` as a dependency.
  // This prevents MemoRow / MemoCell from re-rendering on every cell change.
  const rowsRef = React.useRef(rows);
  rowsRef.current = rows;

  /* ── Auto-increment: always keep an empty row at the bottom ── */
  React.useEffect(() => {
    if (!autoIncrement || disabled) return;
    if (maxRows > 0 && rows.length >= maxRows) return;

    // If no rows, or the last row has data in it, append an empty row
    if (rows.length === 0 || !isRowEmpty(rows[rows.length - 1], columns)) {
      const newRow: TRow = { _id: crypto.randomUUID() };
      onChange([...rows, newRow]);
    }
  }, [autoIncrement, rows, columns, onChange, disabled, maxRows]);

  const handleCellChange = React.useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      const updated = rowsRef.current.map((r) =>
        r._id === rowId ? { ...r, [columnId]: value } : r,
      );
      onChange(updated);
    },
    [onChange],
  );

  const handleAddRow = React.useCallback(() => {
    if (maxRows > 0 && rowsRef.current.length >= maxRows) return;
    const newRow: TRow = { _id: crypto.randomUUID() };
    onChange([...rowsRef.current, newRow]);
  }, [onChange, maxRows]);

  const handleDeleteRow = React.useCallback(
    (rowId: string) => {
      onChange(rowsRef.current.filter((r) => r._id !== rowId));
    },
    [onChange],
  );

  const handleMoveUp = React.useCallback(
    (rowId: string) => {
      const idx = rowsRef.current.findIndex((r) => r._id === rowId);
      if (idx <= 0) return;
      const next = [...rowsRef.current];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      onChange(next);
    },
    [onChange],
  );

  const handleMoveDown = React.useCallback(
    (rowId: string) => {
      const idx = rowsRef.current.findIndex((r) => r._id === rowId);
      if (idx === -1 || idx >= rowsRef.current.length - 1) return;
      const next = [...rowsRef.current];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      onChange(next);
    },
    [onChange],
  );

  const hasActions = deletable || rowReorder;
  const showAddButton = addable && !autoIncrement;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const Icon = col.icons?.headerIcon;
                return (
                  <TableHead
                    key={col.id}
                    style={{ minWidth: col.minWidth ?? 120 }}
                    className="px-2"
                  >
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span>{col.header}</span>
                      {col.required && <span className="text-destructive">*</span>}
                    </div>
                  </TableHead>
                );
              })}
              {hasActions && <TableHead className="w-20 px-2" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && !autoIncrement ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="h-20 text-center text-muted-foreground"
                >
                  No rows yet. Click &quot;{addLabel}&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <MemoRow
                  key={row._id}
                  row={row}
                  columns={columns}
                  onCellChange={handleCellChange}
                  onDelete={handleDeleteRow}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  deletable={deletable}
                  rowReorder={rowReorder}
                  isFirst={idx === 0}
                  isLast={idx === rows.length - 1}
                  disabled={disabled}
                  errors={errors?.[row._id]}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showAddButton && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleAddRow}
          disabled={disabled || (maxRows > 0 && rows.length >= maxRows)}
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
