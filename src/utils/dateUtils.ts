/**
 * Centralized date formatting utilities powered by date-fns.
 *
 * STRICT RULE: ALL dates displayed in the UI must use these helpers.
 * DO NOT use toLocaleDateString(), new Intl.DateTimeFormat(), or
 * any other formatting elsewhere — always import and call these functions.
 *
 * The display format is configurable via CalendarSettings and stored in
 * localStorage under 'dentisyn-calendar-settings'.dateFormat.
 * Default: 'dd.MM.yyyy' (Bulgarian convention).
 *
 * Internal storage format (for <input type="date"> values and ISO strings)
 * remains yyyy-mm-dd as required by the HTML spec.
 */

import { format as dfFormat } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

// ── Supported date-format tokens (date-fns style) ──

export type DateFormatPattern =
  | 'dd.MM.yyyy'   // BG default  → 15.03.2026
  | 'dd/MM/yyyy'   // BG alt      → 15/03/2026
  | 'MM/dd/yyyy'   // US          → 03/15/2026
  | 'yyyy-MM-dd';  // ISO         → 2026-03-15

export const DATE_FORMAT_OPTIONS: { value: DateFormatPattern; label: string }[] = [
  { value: 'dd.MM.yyyy', label: '15.03.2026  (дд.мм.гггг)' },
  { value: 'dd/MM/yyyy', label: '15/03/2026  (дд/мм/гггг)' },
  { value: 'MM/dd/yyyy', label: '03/15/2026  (мм/дд/гггг)' },
  { value: 'yyyy-MM-dd', label: '2026-03-15  (гггг-мм-дд)' },
];

const SETTINGS_KEY = 'dentisyn-calendar-settings';

/** Read the persisted date-format pattern, falling back to BG default. */
export function getDateFormat(): DateFormatPattern {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.dateFormat) return parsed.dateFormat as DateFormatPattern;
    }
  } catch { /* use default */ }
  return 'dd.MM.yyyy';
}

/** Return the date-fns locale matching the current i18n language. */
function getLocale(): typeof bg | typeof enUS {
  try {
    const lang = localStorage.getItem('dentisyn-language') || 'BG';
    return lang === 'BG' ? bg : enUS;
  } catch { return bg; }
}

// ── Helpers ──

/** Normalise the input into a Date object. */
function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

/**
 * Format a date for UI display using the configured pattern.
 *
 * @example formatDate('2026-03-15') → '15.03.2026'  (with default BG format)
 */
export function formatDate(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  return dfFormat(d, getDateFormat(), { locale: getLocale() });
}

/**
 * Format a date+time for UI display: <configured-date> HH:mm
 *
 * @example formatDateTime('2026-03-15T09:30:00') → '15.03.2026 09:30'
 */
export function formatDateTime(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  return dfFormat(d, `${getDateFormat()} HH:mm`, { locale: getLocale() });
}

/**
 * Format just the time portion: HH:mm
 *
 * @example formatTime('2026-03-15T09:30:00') → '09:30'
 */
export function formatTime(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  return dfFormat(d, 'HH:mm', { locale: getLocale() });
}

/**
 * Convert a Date to the yyyy-MM-dd string required by <input type="date">.
 * NOT for display — only for populating form inputs and ISO storage.
 *
 * @example toInputDate(new Date('2026-03-15')) → '2026-03-15'
 */
export function toInputDate(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  return dfFormat(d, 'yyyy-MM-dd');
}
