/**
 * Calendar constants and color definitions
 */

export const CALENDAR_CONFIG = {
  DEFAULT_VIEW: 'timeGridWeek',
  DOCTOR_COLORS: {
    'dr-ivanov': '#16a34a' as const,  // Green-600
    'dr-ruseva': '#2563eb' as const   // Blue-600
  } as const,
  TIME_SLOTS: {
    DEFAULT_DURATION_MINUTES: 30,
    HOUR_PADDING: 1
  }
} as const;

export type DoctorId = keyof typeof CALENDAR_CONFIG.DOCTOR_COLORS;

export const getDoctorColor = (doctorId: string): string => {
  if (doctorId === 'dr-ivanov') return CALENDAR_CONFIG.DOCTOR_COLORS['dr-ivanov'];
  if (doctorId === 'dr-ruseva') return CALENDAR_CONFIG.DOCTOR_COLORS['dr-ruseva'];
  return '#6b7280'; // fallback gray
};

export const VIEW_NAMES = ['timeGridWeek', 'dayGridMonth', 'listWeek'] as const;

export const FILTER_DEBOUNCE_MS = 300;
export const TOOLTIP_DELAY_MS = 500;
