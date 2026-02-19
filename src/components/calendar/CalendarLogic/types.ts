import type { Calendar } from '@fullcalendar/core';

/**
 * Global calendar instance reference
 */
export let calendarInstance: Calendar | null = null;

/**
 * Set the global calendar instance
 */
export const setCalendarInstance = (instance: Calendar | null) => {
  calendarInstance = instance;
};

/**
 * Get the global calendar instance
 */
export const getCalendarInstance = () => calendarInstance;
