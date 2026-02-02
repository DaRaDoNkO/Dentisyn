import { loadCalendarSettings } from './storage';

/**
 * Render Calendar Settings Page
 */
export const renderCalendarSettings = (): string => {
  const settings = loadCalendarSettings();

  return `
    <div class="container-xxl calendar-settings-page py-4">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="mb-2">
            <i class="bi bi-gear-fill me-2"></i>
            <span data-i18n="settings.calendarSettings">Calendar Settings</span>
          </h2>
          <p class="text-muted mb-0" data-i18n="settings.subtitle">
            Configure your calendar preferences and doctor schedules
          </p>
        </div>
        <span class="badge text-bg-light border calendar-settings-badge" data-i18n="settings.badge">
          Clinic Preferences
        </span>
      </div>

      <form id="calendarSettingsForm">
        <!-- Global Preferences Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header calendar-settings-card-header">
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
              <select class="form-select calendar-settings-select" id="slotDuration" name="slotDuration">
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
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header calendar-settings-card-header">
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
                <div class="calendar-settings-schedule border rounded-3 p-3 mb-3">
                  <div class="row g-3 align-items-end">
                    <div class="col-12 col-lg-3">
                      <label class="form-label fw-semibold mb-1">${schedule.doctorName}</label>
                      <div class="text-muted small">Weekly hours</div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-4">
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
                    <div class="col-12 col-md-6 col-lg-4">
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
                    <div class="col-12 col-lg-1 text-lg-center">
                      <span class="calendar-settings-icon">
                        <i class="bi bi-clock"></i>
                      </span>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="calendar-settings-actions d-flex flex-column flex-sm-row gap-2">
          <button type="submit" class="btn btn-primary btn-sm px-4" id="saveSettingsBtn">
            <i class="bi bi-check-circle me-2"></i>
            <span data-i18n="settings.save">Save</span>
          </button>
          <button type="button" class="btn btn-outline-secondary btn-sm px-4" id="resetSettingsBtn">
            <i class="bi bi-arrow-counterclockwise me-2"></i>
            <span data-i18n="settings.discard">Discard</span>
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
