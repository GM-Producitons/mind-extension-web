"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

export interface ConfirmDialogProps {
  /** Element that triggers the dialog when clicked */
  trigger?: React.ReactNode;
  /** Whether the dialog is open (controlled) */
  open?: boolean;
  /** Callback when open state changes (controlled) */
  onOpenChange?: (open: boolean) => void;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Text for the cancel button */
  cancelLabel?: string;
  /** Text for the confirm button */
  confirmLabel?: string;
  /** Visual variant of the confirm button */
  confirmVariant?: "default" | "destructive" | "outline" | "secondary";
  /** Loading state for the confirm action */
  loading?: boolean;
  /** Called when the user confirms */
  onConfirm: () => void | Promise<void>;
  /** Called when the user cancels */
  onCancel?: () => void;
  /** Custom icon rendered in the header */
  icon?: React.ReactNode;
  /** Additional className on the content */
  className?: string;
}

/* ─────────────────────────────────────────────── */
/*  Component                                      */
/* ─────────────────────────────────────────────── */

export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmVariant = "destructive",
  loading = false,
  onConfirm,
  onCancel,
  icon,
  className,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isLoading = loading || internalLoading;

  const handleConfirm = async () => {
    const result = onConfirm();
    if (result instanceof Promise) {
      setInternalLoading(true);
      try {
        await result;
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className={cn(className)}>
        <AlertDialogHeader>
          {icon && <div className="mb-2">{icon}</div>}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            asChild
          >
            <AlertDialogAction
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
