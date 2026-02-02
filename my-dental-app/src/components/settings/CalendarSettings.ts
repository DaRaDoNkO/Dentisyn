import type { Doctor } from '../../types/patient';

export interface CalendarSettings {
  timeFormat: '24h' | '12h';
  slotDuration: 15 | 30 | 60;
  doctorSchedules: DoctorSchedule[];
}

export interface DoctorSchedule {
  doctorId: Doctor;
  doctorName: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

const SETTINGS_KEY = 'dentisyn-calendar-settings';

// Default settings
const defaultSettings: CalendarSettings = {
  timeFormat: '24h',
  slotDuration: 30,
  doctorSchedules: [
    { doctorId: 'dr-ivanov', doctorName: 'Dr. Ivanov', startTime: '08:00', endTime: '18:00' },
    { doctorId: 'dr-ruseva', doctorName: 'Dr. Ruseva', startTime: '09:00', endTime: '17:00' },
  ],
};

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

/**
 * Render Calendar Settings Page
 */
export const renderCalendarSettings = (): string => {
  const settings = loadCalendarSettings();

  return `
    <div class="container-fluid p-4">
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">
            <i class="bi bi-gear-fill me-2"></i>
            <span data-i18n="settings.calendarSettings">Calendar Settings</span>
          </h2>
          <p class="text-muted" data-i18n="settings.subtitle">
            Configure your calendar preferences and doctor schedules
          </p>
        </div>
      </div>

      <form id="calendarSettingsForm">
        <!-- Global Preferences Card -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0" data-i18n="settings.globalPreferences">Global Preferences</h5>
          </div>
          <div class="card-body">
            <!-- Time Format -->
            <div class="mb-4">
              <label class="form-label fw-bold" data-i18n="settings.timeFormat">Time Format</label>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="timeFormat"
                  id="timeFormat24h"
                  value="24h"
                  ${settings.timeFormat === '24h' ? 'checked' : ''}
                >
                <label class="form-check-label" for="timeFormat24h">
                  24-hour (e.g., 14:30)
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="timeFormat"
                  id="timeFormat12h"
                  value="12h"
                  ${settings.timeFormat === '12h' ? 'checked' : ''}
                >
                <label class="form-check-label" for="timeFormat12h">
                  12-hour (e.g., 2:30 PM)
                </label>
              </div>
            </div>

            <!-- Slot Duration -->
            <div class="mb-3">
              <label for="slotDuration" class="form-label fw-bold" data-i18n="settings.slotDuration">
                Appointment Slot Duration
              </label>
              <select class="form-select" id="slotDuration" name="slotDuration" style="max-width: 300px;">
                <option value="15" ${settings.slotDuration === 15 ? 'selected' : ''}>15 minutes</option>
                <option value="30" ${settings.slotDuration === 30 ? 'selected' : ''}>30 minutes (Default)</option>
                <option value="60" ${settings.slotDuration === 60 ? 'selected' : ''}>60 minutes</option>
              </select>
              <small class="form-text text-muted">
                This determines how the calendar divides time slots
              </small>
            </div>
          </div>
        </div>

        <!-- Doctor Schedules Card -->
        <div class="card mb-4">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0" data-i18n="settings.doctorSchedules">Doctor Working Hours</h5>
          </div>
          <div class="card-body">
            <p class="text-muted mb-3" data-i18n="settings.scheduleHint">
              Define the working hours for each doctor. This helps the calendar show available time slots.
            </p>
            
            <div id="doctorSchedulesList">
              ${settings.doctorSchedules
                .map(
                  (schedule) => `
                <div class="row align-items-center mb-3 pb-3 border-bottom">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">${schedule.doctorName}</label>
                  </div>
                  <div class="col-md-4">
                    <label for="startTime-${schedule.doctorId}" class="form-label">Start Time</label>
                    <input
                      type="time"
                      class="form-control"
                      id="startTime-${schedule.doctorId}"
                      name="startTime-${schedule.doctorId}"
                      value="${schedule.startTime}"
                      required
                    >
                  </div>
                  <div class="col-md-4">
                    <label for="endTime-${schedule.doctorId}" class="form-label">End Time</label>
                    <input
                      type="time"
                      class="form-control"
                      id="endTime-${schedule.doctorId}"
                      name="endTime-${schedule.doctorId}"
                      value="${schedule.endTime}"
                      required
                    >
                  </div>
                  <div class="col-md-1 text-center">
                    <i class="bi bi-clock text-muted" style="font-size: 1.5rem;"></i>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-lg" id="saveSettingsBtn">
            <i class="bi bi-check-circle me-2"></i>
            <span data-i18n="settings.saveSettings">Save Settings</span>
          </button>
          <button type="button" class="btn btn-secondary btn-lg" id="resetSettingsBtn">
            <i class="bi bi-arrow-counterclockwise me-2"></i>
            <span data-i18n="settings.resetDefaults">Reset to Defaults</span>
          </button>
        </div>
      </form>

      <!-- Success Alert (hidden by default) -->
      <div id="settingsAlert" class="alert alert-success mt-3" style="display: none;" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        <span data-i18n="settings.savedSuccess">Settings saved successfully! Refresh the calendar page to see changes.</span>
      </div>
    </div>
  `;
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
