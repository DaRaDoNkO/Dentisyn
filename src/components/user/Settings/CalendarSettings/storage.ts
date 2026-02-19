import type { CalendarSettings } from './types';
import { SETTINGS_KEY, defaultSettings } from './types';

/**
 * Load calendar settings from localStorage
 */
export const loadCalendarSettings = (): CalendarSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.info('[DEBUG] Loaded calendar settings from localStorage:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('[ERROR] Failed to load calendar settings:', error);
  }
  console.info('[DEBUG] Using default calendar settings');
  return defaultSettings;
};

/**
 * Save calendar settings to localStorage
 */
export const saveCalendarSettings = (settings: CalendarSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    console.info(
      `[AUDIT] SETTINGS_SAVED | Time: ${new Date().toISOString()} | Settings:`,
      settings
    );
  } catch (error) {
    console.error('[ERROR] Failed to save calendar settings:', error);
  }
};
