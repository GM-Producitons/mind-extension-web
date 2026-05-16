'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAiAutocomplete, type UseAiAutocompleteOptions } from './use-ai-autocomplete';

// ── Criteria badge ────────────────────────────────────────────────

export interface CriteriaItem {
  key: string;
  label: string;
  met: boolean;
}

// ── Props ─────────────────────────────────────────────────────────

export interface AiAutocompleteTextareaProps extends Omit<
  UseAiAutocompleteOptions,
  'value' | 'onChange'
> {
  /** Controlled value */
  value: string;
  /** Called on every value change */
  onChange: (value: string) => void;

  // ── Textarea passthrough ──────────────────────────────────────
  placeholder?: string;
  /** Additional class applied to the outer wrapper div */
  className?: string;
  /** Minimum textarea height in px. Default: 160 */
  minHeight?: number;

  // ── Header chrome ──────────────────────────────────────────────
  /** Title rendered in the card header */
  title?: React.ReactNode;
  /** Icon rendered before the title */
  icon?: React.ReactNode;
  /**
   * Whether to show the "Generate" streaming button.
   * Requires `buildGeneratePayload` to be provided.
   * Default: true when `buildGeneratePayload` is given, false otherwise.
   */
  showGenerateButton?: boolean;

  // ── Criteria badges ────────────────────────────────────────────
  /** Optional criteria checklist rendered above the textarea */
  criteria?: CriteriaItem[];
  /** Text rendered below the textarea. Falls back to generic progress text. */
  footerText?: string;
}

// ── Component ─────────────────────────────────────────────────────

export function AiAutocompleteTextarea({
  value,
  onChange,
  placeholder,
  className,
  minHeight = 160,
  title,
  icon,
  showGenerateButton,
  criteria,
  footerText,
  // hook options
  apiEndpoint,
  buildSuggestionPayload,
  buildGeneratePayload,
  minLength,
  debounceMs,
  enabled,
}: AiAutocompleteTextareaProps) {
  const canGenerate = !!buildGeneratePayload;
  const showGenBtn = showGenerateButton ?? canGenerate;

  const {
    suggestion,
    isLoadingAi,
    isGenerating,
    textareaRef,
    handleChange,
    handleKeyDown,
    handleGenerate,
  } = useAiAutocomplete({
    value,
    onChange,
    apiEndpoint,
    buildSuggestionPayload,
    buildGeneratePayload,
    minLength,
    debounceMs,
    enabled,
  });

  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      {/* Header */}
      {(title || icon || showGenBtn) && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title && <h3 className="text-base font-semibold text-[#003366]">{title}</h3>}
          </div>
          <div className="flex items-center gap-2">
            {isLoadingAi && !isGenerating && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing…
              </div>
            )}
            {suggestion && !isLoadingAi && !isGenerating && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>
                  Press{' '}
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                    Tab
                  </kbd>{' '}
                  to accept
                </span>
              </div>
            )}
            {showGenBtn && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-[#003366]"
                onClick={handleGenerate}
                disabled={isLoadingAi}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Stop
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3" />
                    Generate
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Criteria badges */}
      {criteria && criteria.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <AnimatePresence>
            {criteria.map((item) => (
              <motion.div
                key={item.key}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant={item.met ? 'default' : 'outline'}
                  className={cn(
                    'gap-1 text-xs transition-colors',
                    item.met
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
                  )}
                >
                  {item.met ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {item.label}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor + ghost text */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating}
          className={cn(
            'w-full resize-none bg-transparent text-sm leading-relaxed outline-none',
            'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70',
          )}
          style={{ minHeight, caretColor: 'auto' }}
        />

        {/* Ghost suggestion — Copilot-style overlay */}
        {suggestion && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap text-sm leading-relaxed"
          >
            {/* Mirror real text to position ghost correctly */}
            <span className="invisible">{value}</span>
            {/* Suggestion shown as an example hint */}
            <span className="text-muted-foreground/50">{suggestion}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      {footerText && <p className="mt-2 text-xs text-muted-foreground">{footerText}</p>}
    </div>
  );
}
