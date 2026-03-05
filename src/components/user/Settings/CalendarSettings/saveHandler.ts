import { saveCalendarSettings } from './storage';
import { resetSnapshot, readFormValues } from './changeTracker';

let refreshCalendarSettings: (() => void) | null = null;

export const setRefreshCallback = (callback: () => void) => {
  refreshCalendarSettings = callback;
};

export function performSave(settingsAlert: HTMLElement | null): void {
  console.info('[DEBUG] Saving calendar settings...');

  const settings = readFormValues();
  if (!settings) return;

  saveCalendarSettings(settings);
  resetSnapshot();

  if (refreshCalendarSettings) {
    try {
      refreshCalendarSettings();
      console.info('[DEBUG] Calendar settings applied immediately');
    } catch (error) {
      console.error('[ERROR] Failed to refresh calendar settings:', error);
    }
  }

  if (settingsAlert) {
    settingsAlert.style.display = 'block';
    setTimeout(() => { settingsAlert.style.display = 'none'; }, 5000);
  }

  console.info(`[AUDIT] SETTINGS_SAVED | Time: ${new Date().toISOString()}`);
}
