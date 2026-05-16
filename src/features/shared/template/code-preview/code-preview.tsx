"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

export interface CodePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title for this showcase section */
  title: string;
  /** Description of the component being showcased */
  description?: string;
  /** The code string to display */
  code: string;
  /** The live component preview */
  children: React.ReactNode;
  /** Default active tab */
  defaultTab?: "preview" | "code";
}

/* ─────────────────────────────────────────────── */
/*  Component                                      */
/* ─────────────────────────────────────────────── */

export function CodePreview({
  title,
  description,
  code,
  children,
  defaultTab = "preview",
  className,
  ...props
}: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">(defaultTab);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn("rounded-xl border bg-card overflow-hidden", className)}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          <TabButton
            active={activeTab === "preview"}
            onClick={() => setActiveTab("preview")}
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Preview"
          />
          <TabButton
            active={activeTab === "code"}
            onClick={() => setActiveTab("code")}
            icon={<Code className="h-3.5 w-3.5" />}
            label="Code"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-30">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="p-6"
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative"
            >
              {/* Copy button */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 z-10 h-7 w-7"
                onClick={handleCopy}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "check" : "copy"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </Button>

              <pre className="overflow-x-auto p-4 text-xs leading-relaxed bg-muted/30">
                <code className="text-foreground/80 whitespace-pre">
                  {code.trim()}
                </code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  Internal: Tab Button                           */
/* ─────────────────────────────────────────────── */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.div
          layoutId="code-preview-tab"
          className="absolute inset-0 rounded-md bg-background shadow-sm"
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
}
