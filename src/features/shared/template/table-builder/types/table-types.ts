import type { LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────── */
/*  Table Column Types                             */
/* ─────────────────────────────────────────────── */

/** Supported cell types */
export type TableCellType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "file"
  | "custom";

/** Single select option */
export interface TableSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Column icon config */
export interface TableColumnIcons {
  headerIcon?: LucideIcon;
  cellStartIcon?: LucideIcon;
  cellEndIcon?: LucideIcon;
}

/* ─────────────────────────────────────────────── */
/*  Table Column Schema                            */
/* ─────────────────────────────────────────────── */

export interface TableColumnSchema {
  /** Unique column identifier (also the key in row data) */
  id: string;
  /** Cell type */
  type: TableCellType;
  /** Column header text */
  header: string;
  /** Placeholder for input cells */
  placeholder?: string;
  /** Minimum column width */
  minWidth?: number;
  /** Whether the column is required */
  required?: boolean;
  /** Whether the column is read-only */
  readOnly?: boolean;
  /** Icons */
  icons?: TableColumnIcons;
  /** Select options (when type is "select") */
  options?: TableSelectOption[];
  /** Props forwarded to the cell component */
  props?: Record<string, unknown>;
  /** Custom cell renderer */
  render?: (ctx: TableCellRenderContext) => React.ReactNode;
}

/* ─────────────────────────────────────────────── */
/*  Table Schema                                   */
/* ─────────────────────────────────────────────── */

export interface TableSchema {
  columns: TableColumnSchema[];
}

/* ─────────────────────────────────────────────── */
/*  Row Data                                       */
/* ─────────────────────────────────────────────── */

export interface TableRow {
  /** Unique row identifier */
  _id: string;
  [key: string]: unknown;
}

/* ─────────────────────────────────────────────── */
/*  Render Context                                 */
/* ─────────────────────────────────────────────── */

export interface TableCellRenderContext {
  row: TableRow;
  column: TableColumnSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  rowIndex: number;
}

/* ─────────────────────────────────────────────── */
/*  Cell Component Props                           */
/* ─────────────────────────────────────────────── */

export interface TableCellComponentProps {
  column: TableColumnSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

/* ─────────────────────────────────────────────── */
/*  TableBuilder Props                             */
/* ─────────────────────────────────────────────── */

export interface TableBuilderProps {
  /** Schema defining columns */
  schema: TableSchema;
  /** Row data (controlled) */
  rows: TableRow[];
  /** Called when rows change */
  onChange: (rows: TableRow[]) => void;
  /** Whether to allow adding rows */
  addable?: boolean;
  /** Whether to allow deleting rows */
  deletable?: boolean;
  /** Whether the table is disabled */
  disabled?: boolean;
  /** Additional className */
  className?: string;
  /** Label for the add button */
  addLabel?: string;
  /** Maximum number of rows (0 = unlimited) */
  maxRows?: number;
  /** Validation errors: { rowId: { columnId: errorMessage } } */
  errors?: Record<string, Record<string, string>>;
  /** Auto-increment: always keep an empty row at the bottom */
  autoIncrement?: boolean;
  /** Show row reorder arrows (move up / move down) */
  rowReorder?: boolean;
}
