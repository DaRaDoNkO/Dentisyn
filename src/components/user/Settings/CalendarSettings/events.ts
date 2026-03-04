import type { CalendarSettings, DoctorSchedule } from './types';
import type { DateFormatPattern } from '../../../../utils/dateUtils';
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

    // Get date format
    const dateFormatInput = form.querySelector(
      '#dateFormat'
    ) as HTMLSelectElement;
    const dateFormat = (dateFormatInput?.value || 'dd.MM.yyyy') as DateFormatPattern;

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

    // Get week start day from form (if present) or preserve current
    const weekStartInput = form.querySelector('#weekStartDay') as HTMLSelectElement;
    const weekStartDay = weekStartInput
      ? (parseInt(weekStartInput.value, 10) as 0 | 1)
      : currentSettings.weekStartDay;

    // Collect hidden days from checkboxes (if present) or preserve current
    const hiddenDaysCheckboxes = form.querySelectorAll<HTMLInputElement>('input[name="hiddenDays"]:checked');
    const hiddenDays = hiddenDaysCheckboxes.length > 0 || form.querySelector('input[name="hiddenDays"]')
      ? Array.from(hiddenDaysCheckboxes).map(cb => parseInt(cb.value, 10))
      : currentSettings.hiddenDays;

    // Build settings object
    const settings: CalendarSettings = {
      timeFormat,
      dateFormat,
      slotDuration,
      weekStartDay,
      hiddenDays,
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
