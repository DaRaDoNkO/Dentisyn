/**
 * Centralized date formatting utilities.
 *
 * STRICT RULE: ALL dates displayed in the UI must use dd/mm/yyyy.
 * DO NOT use toLocaleDateString(), new Intl.DateTimeFormat(), or
 * any other formatting elsewhere — always import and call these functions.
 *
 * Internal storage format (for <input type="date"> values and ISO strings)
 * remains yyyy-mm-dd as required by the HTML spec.
 */

/**
 * Normalise the input into a Date object.
 * Accepts a Date, ISO string, or yyyy-mm-dd string.
 */
function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

/**
 * Format a date for UI display: dd/mm/yyyy
 *
 * @example formatDate('2026-03-15') → '15/03/2026'
 */
export function formatDate(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format a date+time for UI display: dd/mm/yyyy HH:MM
 *
 * @example formatDateTime('2026-03-15T09:30:00') → '15/03/2026 09:30'
 */
export function formatDateTime(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(d)} ${HH}:${MM}`;
}

/**
 * Format just the time portion: HH:MM
 *
 * @example formatTime('2026-03-15T09:30:00') → '09:30'
 */
export function formatTime(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  return `${HH}:${MM}`;
}

/**
 * Convert a Date to the yyyy-mm-dd string required by <input type="date"> values.
 * NOT for display — only for populating form inputs and ISO storage.
 *
 * @example toInputDate(new Date('2026-03-15')) → '2026-03-15'
 */
export function toInputDate(value: Date | string): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
