'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldComponentProps } from './text-field';

/* ─────────────────────────────────────────────── */
/*  Helpers                                        */
/* ─────────────────────────────────────────────── */

function getNearestRoundedTime(): { hours: string; minutes: string } {
  const now = new Date();
  let h = now.getHours();
  let m = Math.round(now.getMinutes() / 15) * 15;
  if (m === 60) {
    m = 0;
    h = (h + 1) % 24;
  }
  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
  };
}

function parseTime(value: string): { hours: string; minutes: string } {
  const parts = value.split(':');
  if (parts.length === 2 && parts[0] && parts[1]) {
    return {
      hours: parts[0].padStart(2, '0'),
      minutes: parts[1].padStart(2, '0'),
    };
  }
  return getNearestRoundedTime();
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

/* ─────────────────────────────────────────────── */
/*  TimePickerField                                */
/* ─────────────────────────────────────────────── */

export function TimePickerField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled,
}: FieldComponentProps<T>) {
  const raw = typeof value === 'string' ? value : '';
  const { hours, minutes } = React.useMemo(() => parseTime(raw), [raw]);

  // Auto-initialize with the nearest rounded time when the field has no value.
  // Runs only once on mount so the form state reflects a sensible default.
  React.useEffect(() => {
    if (!raw) {
      const { hours: h, minutes: m } = getNearestRoundedTime();
      onChange(`${h}:${m}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHour = (h: string) => onChange(`${h}:${minutes}`);
  const handleMinute = (m: string) => onChange(`${hours}:${m}`);

  return (
    <div className="flex items-center gap-1.5">
      <Select value={hours} onValueChange={handleHour} disabled={disabled}>
        <SelectTrigger className="w-18">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="shrink-0 text-sm font-medium text-muted-foreground">:</span>
      <Select value={minutes} onValueChange={handleMinute} disabled={disabled}>
        <SelectTrigger className="w-18">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
