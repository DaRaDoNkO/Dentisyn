import type { CalendarSettings } from './types';
import { SETTINGS_KEY, defaultSettings, getDefaultRejectionReasons } from './types';

/**
 * Load calendar settings from localStorage
 */
export const loadCalendarSettings = (): CalendarSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults for any new fields added after initial save
      const merged: CalendarSettings = {
        ...defaultSettings,
        ...parsed,
        // Ensure critical fields always have valid values (guards against null/undefined from older saves)
        hiddenDays: Array.isArray(parsed.hiddenDays) ? parsed.hiddenDays : defaultSettings.hiddenDays,
        weekStartDay: typeof parsed.weekStartDay === 'number' ? parsed.weekStartDay : defaultSettings.weekStartDay,
        doctorSchedules: Array.isArray(parsed.doctorSchedules) ? parsed.doctorSchedules : defaultSettings.doctorSchedules,
        rejectionReasons: Array.isArray(parsed.rejectionReasons) && parsed.rejectionReasons.length > 0
          ? parsed.rejectionReasons
          : getDefaultRejectionReasons(),
      };
      console.info('[DEBUG] Loaded calendar settings from localStorage:', merged);
      return merged;
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
