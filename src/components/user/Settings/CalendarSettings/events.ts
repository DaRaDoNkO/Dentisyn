import type { CalendarSettings, DoctorSchedule } from './types';
import { defaultSettings } from './types';
import { loadCalendarSettings, saveCalendarSettings } from './storage';

// Import the refresh function to apply settings immediately
let refreshCalendarSettings: (() => void) | null = null;

// Allow setting the refresh callback from outside
export const setRefreshCallback = (callback: () => void) => {
  refreshCalendarSettings = callback;
};

/**
 * Initialize Calendar Settings page event handlers
 */
export const initCalendarSettings = () => {
  const form = document.getElementById('calendarSettingsForm') as HTMLFormElement;
  const resetBtn = document.getElementById('resetSettingsBtn') as HTMLButtonElement;
  const settingsAlert = document.getElementById('settingsAlert') as HTMLElement;

  if (!form) {
    console.error('[ERROR] calendarSettingsForm not found');
    return;
  }

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.info('[DEBUG] Saving calendar settings...');

    // Get time format
    const timeFormatInput = form.querySelector(
      'input[name="timeFormat"]:checked'
    ) as HTMLInputElement;
    const timeFormat = (timeFormatInput?.value || '24h') as '24h' | '12h';

    // Get slot duration
    const slotDurationInput = form.querySelector(
      '#slotDuration'
    ) as HTMLSelectElement;
    const slotDuration = parseInt(slotDurationInput?.value || '30') as 15 | 30 | 60;

    // Get doctor schedules
    const doctorSchedules: DoctorSchedule[] = [];
    const currentSettings = loadCalendarSettings();

    currentSettings.doctorSchedules.forEach((schedule) => {
      const startTimeInput = document.getElementById(
        `startTime-${schedule.doctorId}`
      ) as HTMLInputElement;
      const endTimeInput = document.getElementById(
        `endTime-${schedule.doctorId}`
      ) as HTMLInputElement;

      if (startTimeInput && endTimeInput) {
        doctorSchedules.push({
          doctorId: schedule.doctorId,
          doctorName: schedule.doctorName,
          startTime: startTimeInput.value,
          endTime: endTimeInput.value,
        });
      }
    });

    // Build settings object
    const settings: CalendarSettings = {
      timeFormat,
      slotDuration,
      doctorSchedules,
    };

    // Save to localStorage
    saveCalendarSettings(settings);

    // Apply settings immediately to calendar if available
    if (refreshCalendarSettings) {
      try {
        refreshCalendarSettings();
        console.info('[DEBUG] Calendar settings applied immediately');
      } catch (error) {
        console.error('[ERROR] Failed to refresh calendar settings:', error);
      }
    }

    // Show success alert
    if (settingsAlert) {
      settingsAlert.style.display = 'block';
      setTimeout(() => {
        settingsAlert.style.display = 'none';
      }, 5000);
    }

    console.info('[DEBUG] Calendar settings saved:', settings);
  });

  // Handle reset to defaults
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const confirmed = confirm(
        'Are you sure you want to reset all settings to default values?'
      );

      if (confirmed) {
        saveCalendarSettings(defaultSettings);
        
        // Reload the page to show default values
        window.location.reload();
        
        console.info('[DEBUG] Settings reset to defaults');
      }
    });
  }
};
