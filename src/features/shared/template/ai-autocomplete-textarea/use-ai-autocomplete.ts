'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────

export interface UseAiAutocompleteOptions {
  /** Current controlled value of the textarea */
  value: string;
  /** Called whenever the value should change (user typing or AI accept/generate) */
  onChange: (value: string) => void;
  /**
   * API endpoint to POST autocomplete requests to.
   * Must accept `{ mode: 'suggestion' | 'generate', systemPrompt, userPrompt, maxTokens? }`.
   */
  apiEndpoint: string;
  /**
   * Builds the POST body for ghost-text suggestions.
   * Return `null` to skip the AI call entirely (e.g. when criteria are fully met).
   */
  buildSuggestionPayload: (value: string) => Record<string, unknown> | null;
  /**
   * Builds the POST body for full-text generation (streaming).
   * If omitted the generate button will not be rendered.
   */
  buildGeneratePayload?: (value: string) => Record<string, unknown>;
  /** Minimum character count before suggestions are requested. Default: 15 */
  minLength?: number;
  /** Idle debounce before requesting a suggestion, in ms. Default: 900 */
  debounceMs?: number;
  /** Disable all AI behaviour (still renders the textarea). Default: false */
  enabled?: boolean;
}

export interface UseAiAutocompleteReturn {
  suggestion: string | null;
  isLoadingAi: boolean;
  isGenerating: boolean;
  /** Stable ref — pass directly to `<textarea ref={...}>` */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Accept the current ghost-text suggestion (Tab handler) */
  acceptSuggestion: () => void;
  /** Dismiss current suggestion without accepting */
  clearSuggestion: () => void;
  /** Start (or stop mid-stream) the full-generation mode */
  handleGenerate: () => void;
  /** Standard onChange handler for the textarea */
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Keyboard handler — wires up Tab-to-accept */
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

// ── Hook ────────────────────────────────────────────────────────

export function useAiAutocomplete({
  value,
  onChange,
  apiEndpoint,
  buildSuggestionPayload,
  buildGeneratePayload,
  minLength = 15,
  debounceMs = 900,
  enabled = true,
}: UseAiAutocompleteOptions): UseAiAutocompleteReturn {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const generateAbortRef = useRef<AbortController | null>(null);
  const suggestionAbortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Suggestion debounce ─────────────────────────────────────

  useEffect(() => {
    if (!enabled || isGenerating) return;

    if (value.length < minLength) {
      setSuggestion(null);
      return;
    }

    // Cancel any in-flight suggestion request
    suggestionAbortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const payload = buildSuggestionPayload(value);
      if (!payload) {
        setSuggestion(null);
        return;
      }

      suggestionAbortRef.current = new AbortController();
      setIsLoadingAi(true);
      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: suggestionAbortRef.current.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestion(data.suggestion ?? null);
        }
      } catch {
        // Silently ignore — AI is optional
      } finally {
        setIsLoadingAi(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, enabled, isGenerating, minLength, debounceMs]);

  // ── Textarea resize ─────────────────────────────────────────

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(160, el.scrollHeight)}px`;
  }, [value, suggestion]);

  // ── Accept suggestion ───────────────────────────────────────

  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return;
    // Append with a space separator if needed
    const separator = value.endsWith(' ') || value.endsWith('\n') ? '' : ' ';
    const newValue = value + separator + suggestion;
    onChange(newValue);
    setSuggestion(null);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.selectionStart = newValue.length;
        el.selectionEnd = newValue.length;
      }
    });
  }, [suggestion, value, onChange]);

  const clearSuggestion = useCallback(() => setSuggestion(null), []);

  // ── Full generation (streaming) ─────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!buildGeneratePayload) return;

    if (isGenerating) {
      generateAbortRef.current?.abort();
      return;
    }

    generateAbortRef.current = new AbortController();
    setIsGenerating(true);
    setSuggestion(null);
    onChange('');

    try {
      const payload = buildGeneratePayload(value);
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: generateAbortRef.current.signal,
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      for (;;) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        full += decoder.decode(chunk, { stream: true });
        onChange(full);
      }
    } catch {
      // Aborted or failed silently
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, buildGeneratePayload, apiEndpoint, value, onChange]);

  // ── Handlers ────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSuggestion(null);
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab' && suggestion) {
        e.preventDefault();
        acceptSuggestion();
      }
      // Escape clears the suggestion
      if (e.key === 'Escape' && suggestion) {
        e.preventDefault();
        clearSuggestion();
      }
    },
    [suggestion, acceptSuggestion, clearSuggestion],
  );

  // ── Cleanup on unmount ──────────────────────────────────────

  useEffect(() => {
    return () => {
      suggestionAbortRef.current?.abort();
      generateAbortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    suggestion,
    isLoadingAi,
    isGenerating,
    textareaRef,
    acceptSuggestion,
    clearSuggestion,
    handleGenerate,
    handleChange,
    handleKeyDown,
  };
}
