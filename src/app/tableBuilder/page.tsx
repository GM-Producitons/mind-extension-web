// "use client";

// import { useState, useMemo, useCallback, useEffect } from "react";
// import Link from "next/link";
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   sortableKeyboardCoordinates,
//   verticalListSortingStrategy,
//   useSortable,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
// import { toast } from "sonner";
// import {
//   Type,
//   Hash,
//   ListFilter,
//   CheckSquare,
//   Calendar,
//   Upload,
//   GripVertical,
//   Plus,
//   X,
//   Settings2,
//   Copy,
//   Eye,
//   Code,
//   ArrowLeft,
//   Trash2,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { TableBuilder, useTableState } from "@/features/shared/template";
// import type {
//   TableColumnSchema,
//   TableSchema,
// } from "@/features/shared/template";

// /* ─────────────────────────────────────────────── */
// /*  Types                                          */
// /* ─────────────────────────────────────────────── */

// interface BuilderColumn {
//   id: string;
//   type: string;
//   header: string;
//   name: string;
//   placeholder: string;
//   required: boolean;
//   readOnly: boolean;
//   options: { label: string; value: string }[];
// }

// /* ─────────────────────────────────────────────── */
// /*  Constants                                      */
// /* ─────────────────────────────────────────────── */

// const COLUMN_TYPES = [
//   { type: "text", label: "Text", icon: Type },
//   { type: "number", label: "Number", icon: Hash },
//   { type: "select", label: "Select", icon: ListFilter },
//   { type: "checkbox", label: "Checkbox", icon: CheckSquare },
//   { type: "date", label: "Date", icon: Calendar },
//   { type: "file", label: "File", icon: Upload },
// ] as const;

// /* ─────────────────────────────────────────────── */
// /*  Helpers                                        */
// /* ─────────────────────────────────────────────── */

// function generateId() {
//   return crypto.randomUUID().slice(0, 8);
// }

// function toCamelCase(str: string): string {
//   return str
//     .toLowerCase()
//     .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
//     .replace(/[^a-zA-Z0-9]/g, "");
// }

// function createDefaultColumn(type: string): BuilderColumn {
//   const typeDef = COLUMN_TYPES.find((t) => t.type === type);
//   const header = typeDef?.label ?? "Column";
//   return {
//     id: generateId(),
//     type,
//     header,
//     name: toCamelCase(header),
//     placeholder: "",
//     required: false,
//     readOnly: false,
//     options:
//       type === "select"
//         ? [
//             { label: "Option 1", value: "option1" },
//             { label: "Option 2", value: "option2" },
//           ]
//         : [],
//   };
// }

// /* ─────────────────────────────────────────────── */
// /*  Sortable Column Item                           */
// /* ─────────────────────────────────────────────── */

// function SortableColumnItem({
//   column,
//   onRemove,
//   onEdit,
// }: {
//   column: BuilderColumn;
//   onRemove: (id: string) => void;
//   onEdit: (column: BuilderColumn) => void;
// }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: column.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const typeDef = COLUMN_TYPES.find((t) => t.type === column.type);
//   const Icon = typeDef?.icon ?? Type;

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={cn(
//         "group flex items-center gap-2 rounded-lg border bg-card p-2 transition-shadow",
//         isDragging && "z-50 shadow-lg opacity-90",
//       )}
//     >
//       <button
//         {...attributes}
//         {...listeners}
//         className="flex shrink-0 cursor-grab items-center justify-center rounded px-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
//         tabIndex={-1}
//       >
//         <GripVertical className="h-4 w-4" />
//       </button>

//       <div
//         className="flex min-w-0 flex-1 items-center gap-1.5 cursor-pointer"
//         onClick={() => onEdit(column)}
//       >
//         <Icon className="h-3.5 w-3.5 text-muted-foreground" />
//         <span className="max-w-32 truncate font-medium text-sm">
//           {column.header}
//         </span>
//         {column.required && <span className="text-xs text-destructive">*</span>}
//         <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
//           {typeDef?.label}
//         </Badge>
//       </div>

//       <Tooltip>
//         <TooltipTrigger asChild>
//           <button
//             onClick={() => onRemove(column.id)}
//             className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
//           >
//             <Trash2 className="h-3.5 w-3.5" />
//           </button>
//         </TooltipTrigger>
//         <TooltipContent side="left" className="text-xs">
//           Delete column
//         </TooltipContent>
//       </Tooltip>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────── */
// /*  Column Config Dialog                           */
// /* ─────────────────────────────────────────────── */

// function ColumnConfigDialog({
//   column,
//   open,
//   onOpenChange,
//   onSave,
// }: {
//   column: BuilderColumn | null;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSave: (column: BuilderColumn) => void;
// }) {
//   const [draft, setDraft] = useState<BuilderColumn | null>(null);

//   useEffect(() => {
//     if (column)
//       setDraft({ ...column, options: column.options.map((o) => ({ ...o })) });
//   }, [column]);

//   if (!draft) return null;

//   const hasOptions = draft.type === "select";

//   const handleSave = () => {
//     const finalDraft = {
//       ...draft,
//       name: draft.name || toCamelCase(draft.header || "column"),
//     };
//     onSave(finalDraft);
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Settings2 className="h-4 w-4" />
//             Configure Column
//           </DialogTitle>
//         </DialogHeader>

//         <div className="grid gap-4 py-2">
//           {/* Type */}
//           <div className="grid gap-1.5">
//             <Label className="text-xs">Type</Label>
//             <Select
//               value={draft.type}
//               onValueChange={(v) =>
//                 setDraft((prev) =>
//                   prev
//                     ? {
//                         ...prev,
//                         type: v,
//                         options:
//                           v === "select"
//                             ? prev.options.length > 0
//                               ? prev.options
//                               : [
//                                   { label: "Option 1", value: "option1" },
//                                   { label: "Option 2", value: "option2" },
//                                 ]
//                             : [],
//                       }
//                     : prev,
//                 )
//               }
//             >
//               <SelectTrigger className="h-8">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {COLUMN_TYPES.map((ct) => (
//                   <SelectItem key={ct.type} value={ct.type}>
//                     {ct.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Header */}
//           <div className="grid gap-1.5">
//             <Label className="text-xs">Header</Label>
//             <Input
//               value={draft.header}
//               onChange={(e) =>
//                 setDraft((prev) =>
//                   prev
//                     ? {
//                         ...prev,
//                         header: e.target.value,
//                         name: toCamelCase(e.target.value),
//                       }
//                     : prev,
//                 )
//               }
//               placeholder="Column header"
//               className="h-8"
//             />
//           </div>

//           {/* Name */}
//           <div className="grid gap-1.5">
//             <Label className="text-xs">
//               Name{" "}
//               <span className="text-muted-foreground">(camelCase key)</span>
//             </Label>
//             <Input
//               value={draft.name}
//               onChange={(e) =>
//                 setDraft((prev) =>
//                   prev ? { ...prev, name: e.target.value } : prev,
//                 )
//               }
//               placeholder="columnName"
//               className="h-8 font-mono text-xs"
//             />
//           </div>

//           {/* Placeholder */}
//           <div className="grid gap-1.5">
//             <Label className="text-xs">Placeholder</Label>
//             <Input
//               value={draft.placeholder}
//               onChange={(e) =>
//                 setDraft((prev) =>
//                   prev ? { ...prev, placeholder: e.target.value } : prev,
//                 )
//               }
//               placeholder="Enter placeholder..."
//               className="h-8"
//             />
//           </div>

//           {/* Flags */}
//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="col-required"
//                 checked={draft.required}
//                 onCheckedChange={(c) =>
//                   setDraft((prev) => (prev ? { ...prev, required: !!c } : prev))
//                 }
//               />
//               <label htmlFor="col-required" className="text-sm select-none">
//                 Required
//               </label>
//             </div>
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 id="col-readonly"
//                 checked={draft.readOnly}
//                 onCheckedChange={(c) =>
//                   setDraft((prev) => (prev ? { ...prev, readOnly: !!c } : prev))
//                 }
//               />
//               <label htmlFor="col-readonly" className="text-sm select-none">
//                 Read-only
//               </label>
//             </div>
//           </div>

//           {/* Options (select) */}
//           {hasOptions && (
//             <div className="grid gap-2">
//               <Label className="text-xs">Options</Label>
//               <div className="space-y-2">
//                 {draft.options.map((opt, i) => (
//                   <div key={i} className="flex items-center gap-2">
//                     <Input
//                       value={opt.label}
//                       onChange={(e) => {
//                         const newOptions = [...draft.options];
//                         newOptions[i] = {
//                           label: e.target.value,
//                           value: toCamelCase(e.target.value) || opt.value,
//                         };
//                         setDraft((prev) =>
//                           prev ? { ...prev, options: newOptions } : prev,
//                         );
//                       }}
//                       placeholder="Label"
//                       className="h-7 text-xs"
//                     />
//                     <Input
//                       value={opt.value}
//                       onChange={(e) => {
//                         const newOptions = [...draft.options];
//                         newOptions[i] = { ...opt, value: e.target.value };
//                         setDraft((prev) =>
//                           prev ? { ...prev, options: newOptions } : prev,
//                         );
//                       }}
//                       placeholder="value"
//                       className="h-7 font-mono text-xs"
//                     />
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-7 w-7 shrink-0 p-0"
//                       onClick={() => {
//                         const newOptions = draft.options.filter(
//                           (_, idx) => idx !== i,
//                         );
//                         setDraft((prev) =>
//                           prev ? { ...prev, options: newOptions } : prev,
//                         );
//                       }}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   </div>
//                 ))}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="h-7 gap-1 text-xs"
//                   onClick={() =>
//                     setDraft((prev) =>
//                       prev
//                         ? {
//                             ...prev,
//                             options: [
//                               ...prev.options,
//                               {
//                                 label: `Option ${prev.options.length + 1}`,
//                                 value: `option${prev.options.length + 1}`,
//                               },
//                             ],
//                           }
//                         : prev,
//                     )
//                   }
//                 >
//                   <Plus className="h-3 w-3" />
//                   Add Option
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ─────────────────────────────────────────────── */
// /*  Code Generators                                */
// /* ─────────────────────────────────────────────── */

// function generateTableCode(
//   modelName: string,
//   columns: BuilderColumn[],
// ): string {
//   const componentName = modelName.charAt(0).toUpperCase() + modelName.slice(1);

//   const schemaLines: string[] = [];
//   for (const col of columns) {
//     const lines: string[] = [];
//     lines.push(`      id: "${col.name}",`);
//     lines.push(`      type: "${col.type}",`);
//     lines.push(`      header: "${col.header}",`);
//     if (col.placeholder) lines.push(`      placeholder: "${col.placeholder}",`);
//     if (col.required) lines.push(`      required: true,`);
//     if (col.readOnly) lines.push(`      readOnly: true,`);
//     if (col.options.length > 0) {
//       lines.push(`      options: [`);
//       for (const opt of col.options) {
//         lines.push(`        { label: "${opt.label}", value: "${opt.value}" },`);
//       }
//       lines.push(`      ],`);
//     }
//     schemaLines.push(`    {\n${lines.join("\n")}\n    }`);
//   }

//   return `"use client";

// import { useCallback } from "react";
// import { toast } from "sonner";
// import {
//   TableBuilder,
//   useTableState,
//   useTableAutoSave,
// } from "@/features/shared/components/template";
// import type { TableSchema, TableRow } from "@/features/shared/components/template";
// import { Button } from "@/components/ui/button";

// const schema: TableSchema = {
//   columns: [
// ${schemaLines.join(",\n")}
//   ],
// };

// interface ${componentName}TableProps {
//   /** Called on explicit submit with all rows (excluding empty) */
//   onSubmit?: (rows: Record<string, unknown>[]) => void | Promise<void>;
//   /** Called to sync/auto-save changes */
//   onSync?: (rows: Record<string, unknown>[]) => void | Promise<void>;
//   /** Initial rows to populate the table for editing */
//   initialRows?: TableRow[];
//   /** Whether the table is in a loading/submitting state */
//   loading?: boolean;
// }

// export function ${componentName}Table({
//   onSubmit,
//   onSync,
//   initialRows,
//   loading = false,
// }: ${componentName}TableProps) {
//   const { rows, setRows, addRow, removeRow, moveRow } = useTableState({
//     defaultRows: initialRows,
//   });

//   // Auto-save hook — syncs changes after 2s of inactivity
//   useTableAutoSave({
//     rows,
//     onSave: (currentRows) => {
//       const cleaned = currentRows.map(({ _id, ...rest }) => rest);
//       onSync?.(cleaned);
//     },
//     enabled: !!onSync,
//   });

//   const handleSubmit = useCallback(async () => {
//     // Strip internal _id and empty rows
//     const cleaned = rows
//       .filter((r) => Object.keys(r).some((k) => k !== "_id" && r[k] !== undefined && r[k] !== ""))
//       .map(({ _id, ...rest }) => rest);

//     if (cleaned.length === 0) {
//       toast.error("No data to submit.");
//       return;
//     }

//     try {
//       await onSubmit?.(cleaned);
//       toast.success("Submitted successfully.");
//     } catch {
//       toast.error("Submission failed. Please try again.");
//     }
//   }, [rows, onSubmit]);

//   return (
//     <div className="space-y-4">
//       <TableBuilder
//         schema={schema}
//         rows={rows}
//         onChange={setRows}
//         addLabel="Add ${componentName}"
//         autoIncrement
//         rowReorder
//       />
//       <div className="flex gap-3">
//         {onSubmit && (
//           <Button onClick={handleSubmit} disabled={loading}>
//             {loading ? "Submitting..." : "Submit"}
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }
// `;
// }

// /* ─────────────────────────────────────────────── */
// /*  CodeBlock with Copy                            */
// /* ─────────────────────────────────────────────── */

// function CodeBlock({ code, label }: { code: string; label: string }) {
//   const handleCopy = () => {
//     navigator.clipboard.writeText(code).then(() => {
//       toast.success(`${label} copied to clipboard`);
//     });
//   };

//   return (
//     <div className="relative rounded-lg border bg-muted/30">
//       <div className="flex items-center justify-between border-b px-4 py-2">
//         <span className="text-xs font-medium text-muted-foreground">
//           {label}
//         </span>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-7 gap-1.5 text-xs"
//           onClick={handleCopy}
//         >
//           <Copy className="h-3 w-3" />
//           Copy
//         </Button>
//       </div>
//       <ScrollArea className="max-h-150">
//         <pre className="p-4 text-xs leading-relaxed overflow-x-auto">
//           <code>{code}</code>
//         </pre>
//       </ScrollArea>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────── */
// /*  Main Page                                      */
// /* ─────────────────────────────────────────────── */

// export default function TableBuilderPage() {
//   const [modelName, setModelName] = useState("CrewMember");
//   const [columns, setColumns] = useState<BuilderColumn[]>([]);
//   const [editingColumn, setEditingColumn] = useState<BuilderColumn | null>(
//     null,
//   );
//   const [configOpen, setConfigOpen] = useState(false);

//   // DnD sensors
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     }),
//   );

//   // ─── Column management ──────────────────────

//   const addColumn = useCallback((type: string) => {
//     setColumns((prev) => [...prev, createDefaultColumn(type)]);
//   }, []);

//   const removeColumn = useCallback((colId: string) => {
//     setColumns((prev) => prev.filter((c) => c.id !== colId));
//   }, []);

//   const updateColumn = useCallback((updated: BuilderColumn) => {
//     setColumns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
//   }, []);

//   const handleDragEnd = useCallback((event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;
//     setColumns((prev) => {
//       const oldIndex = prev.findIndex((c) => c.id === active.id);
//       const newIndex = prev.findIndex((c) => c.id === over.id);
//       if (oldIndex === -1 || newIndex === -1) return prev;
//       return arrayMove(prev, oldIndex, newIndex);
//     });
//   }, []);

//   // ─── Build preview schema ────────────────────

//   const previewSchema = useMemo((): TableSchema => {
//     return {
//       columns: columns.map((col) => ({
//         id: col.name,
//         type: col.type as TableColumnSchema["type"],
//         header: col.header,
//         placeholder: col.placeholder || undefined,
//         required: col.required,
//         readOnly: col.readOnly,
//         options:
//           col.options.length > 0
//             ? col.options.map((o) => ({ label: o.label, value: o.value }))
//             : undefined,
//       })),
//     };
//   }, [columns]);

//   const { rows: previewRows, setRows: setPreviewRows } = useTableState();

//   const tableCode = useMemo(
//     () => generateTableCode(modelName, columns),
//     [modelName, columns],
//   );

//   return (
//     <div className="flex h-[calc(100vh-80px)] flex-col gap-4 overflow-hidden p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Link href="/office/admin/testing">
//             <Button variant="ghost" size="sm" className="gap-1.5">
//               <ArrowLeft className="h-4 w-4" />
//               Testing
//             </Button>
//           </Link>
//           <Separator orientation="vertical" className="h-6" />
//           <h1 className="text-lg font-semibold">Table Builder</h1>
//           {columns.length > 0 && (
//             <Badge variant="secondary" className="text-xs">
//               {columns.length} column{columns.length !== 1 ? "s" : ""}
//             </Badge>
//           )}
//         </div>
//         <div className="flex items-center gap-2">
//           <Label className="text-xs text-muted-foreground">Model</Label>
//           <Input
//             value={modelName}
//             onChange={(e) => setModelName(e.target.value)}
//             className="h-8 w-44 font-mono text-sm"
//             placeholder="ModelName"
//           />
//         </div>
//       </div>

//       {/* Main Layout */}
//       <div className="grid flex-1 grid-cols-[340px_1fr] gap-4 overflow-hidden">
//         {/* ─── Left Panel ─────────────────── */}
//         <div className="flex flex-col gap-4 overflow-hidden">
//           {/* Column Palette */}
//           <Card className="shrink-0 py-3">
//             <CardHeader className="px-4 pb-2 pt-0">
//               <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                 Add Column
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 pb-0 pt-0">
//               <div className="grid grid-cols-3 gap-1.5">
//                 {COLUMN_TYPES.map((ct) => {
//                   const Icon = ct.icon;
//                   return (
//                     <Tooltip key={ct.type}>
//                       <TooltipTrigger asChild>
//                         <Button
//                           variant="outline"
//                           className="h-14 flex-col gap-1 text-xs"
//                           onClick={() => addColumn(ct.type)}
//                         >
//                           <Icon className="h-4 w-4" />
//                           {ct.label}
//                         </Button>
//                       </TooltipTrigger>
//                       <TooltipContent side="bottom" className="text-xs">
//                         Add {ct.label} column
//                       </TooltipContent>
//                     </Tooltip>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Column List */}
//           <Card className="flex min-h-0 flex-1 flex-col py-3">
//             <CardHeader className="px-4 pb-2 pt-0">
//               <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                 Columns ({columns.length})
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="flex min-h-0 flex-1 flex-col px-4 pb-0 pt-0">
//               {columns.length === 0 ? (
//                 <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center">
//                   <Plus className="h-6 w-6 text-muted-foreground" />
//                   <p className="text-sm text-muted-foreground">
//                     Click a column type above to start
//                   </p>
//                 </div>
//               ) : (
//                 <ScrollArea className="flex-1">
//                   <DndContext
//                     sensors={sensors}
//                     collisionDetection={closestCenter}
//                     modifiers={[restrictToVerticalAxis]}
//                     onDragEnd={handleDragEnd}
//                   >
//                     <SortableContext
//                       items={columns.map((c) => c.id)}
//                       strategy={verticalListSortingStrategy}
//                     >
//                       <div className="space-y-2 pb-2">
//                         {columns.map((col) => (
//                           <SortableColumnItem
//                             key={col.id}
//                             column={col}
//                             onRemove={removeColumn}
//                             onEdit={(c) => {
//                               setEditingColumn(c);
//                               setConfigOpen(true);
//                             }}
//                           />
//                         ))}
//                       </div>
//                     </SortableContext>
//                   </DndContext>
//                 </ScrollArea>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* ─── Right Panel ────────────────── */}
//         <Card className="flex min-h-0 flex-col overflow-hidden py-3">
//           <Tabs defaultValue="preview" className="flex min-h-0 flex-1 flex-col">
//             <CardHeader className="shrink-0 px-4 pb-2 pt-0">
//               <TabsList className="w-full">
//                 <TabsTrigger value="preview" className="flex-1 gap-1.5">
//                   <Eye className="h-3.5 w-3.5" />
//                   Preview
//                 </TabsTrigger>
//                 <TabsTrigger value="code" className="flex-1 gap-1.5">
//                   <Code className="h-3.5 w-3.5" />
//                   Table Code
//                 </TabsTrigger>
//               </TabsList>
//             </CardHeader>

//             <CardContent className="min-h-0 flex-1 overflow-auto px-4 pb-0 pt-0">
//               {/* Preview Tab */}
//               <TabsContent value="preview" className="mt-0 h-full">
//                 {columns.length === 0 ? (
//                   <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center">
//                     <Eye className="h-6 w-6 text-muted-foreground" />
//                     <p className="text-sm text-muted-foreground">
//                       Add columns to see a live preview
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     <TableBuilder
//                       schema={previewSchema}
//                       rows={previewRows}
//                       onChange={setPreviewRows}
//                       addLabel={`Add ${modelName}`}
//                       autoIncrement
//                       rowReorder
//                     />
//                     {previewRows.length > 0 && (
//                       <div className="rounded-md border bg-muted/30 p-4">
//                         <p className="mb-2 text-xs font-medium text-muted-foreground">
//                           Table Data
//                         </p>
//                         <pre className="text-xs overflow-x-auto">
//                           {JSON.stringify(
//                             previewRows.map(({ _id, ...rest }) => rest),
//                             null,
//                             2,
//                           )}
//                         </pre>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </TabsContent>

//               {/* Code Tab */}
//               <TabsContent value="code" className="mt-0 h-full">
//                 {columns.length === 0 ? (
//                   <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center">
//                     <Code className="h-6 w-6 text-muted-foreground" />
//                     <p className="text-sm text-muted-foreground">
//                       Add columns to generate table code
//                     </p>
//                   </div>
//                 ) : (
//                   <CodeBlock code={tableCode} label="Table Component" />
//                 )}
//               </TabsContent>
//             </CardContent>
//           </Tabs>
//         </Card>
//       </div>

//       {/* Column Config Dialog */}
//       <ColumnConfigDialog
//         column={editingColumn}
//         open={configOpen}
//         onOpenChange={setConfigOpen}
//         onSave={updateColumn}
//       />
//     </div>
//   );
// }

export default function TableBuilder() {
  return <div>Table builder page</div>;
}
