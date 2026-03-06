import { loadCalendarSettings } from './storage';
import { DATE_FORMAT_OPTIONS } from '../../../../utils/dateUtils';
import i18next from '../../../../i18n';

const t = (key: string, fb: string) => i18next.t(key, fb);

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
            <!-- Date Format -->
            <div class="mb-4">
              <label for="dateFormat" class="form-label fw-bold" data-i18n="settings.dateFormat">Date Format</label>
              <select class="form-select calendar-settings-select" id="dateFormat" name="dateFormat">
                ${DATE_FORMAT_OPTIONS.map(o =>
                  `<option value="${o.value}" ${settings.dateFormat === o.value ? 'selected' : ''}>${o.label}</option>`
                ).join('')}
              </select>
              <small class="form-text text-muted" data-i18n="settings.dateFormatHint">
                Controls how dates appear throughout the application
              </small>
            </div>

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

        <!-- Appointment Options Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header calendar-settings-card-header">
            <h5 class="mb-0" data-i18n="settings.appointmentOptions">${t('settings.appointmentOptions', 'Appointment Options')}</h5>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" role="switch" id="isReasonVisible" ${settings.isReasonVisible ? 'checked' : ''}>
                <label class="form-check-label" for="isReasonVisible" data-i18n="settings.isReasonVisible">${t('settings.isReasonVisible', 'Reason field visible')}</label>
              </div>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" role="switch" id="isReasonRequired" ${settings.isReasonRequired ? 'checked' : ''}>
                <label class="form-check-label" for="isReasonRequired" data-i18n="settings.isReasonRequired">${t('settings.isReasonRequired', 'Reason is required')}</label>
              </div>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" role="switch" id="isNotesRequired" ${settings.isNotesRequired ? 'checked' : ''}>
                <label class="form-check-label" for="isNotesRequired" data-i18n="settings.isNotesRequired">${t('settings.isNotesRequired', 'Notes are required')}</label>
              </div>
            </div>

            <h6 class="mb-2" data-i18n="settings.appointmentReasons">${t('settings.appointmentReasons', 'Default Appointment Reasons')}</h6>
            <p class="text-muted mb-3" data-i18n="settings.appointmentReasonsDesc" style="font-size: 0.85rem;">
              ${t('settings.appointmentReasonsDesc', 'List of predefined reasons available in the appointment modal. Users can still type custom reasons.')}
            </p>
            <div id="appointmentReasonsChips" class="d-flex flex-wrap gap-2 mb-3">
              ${settings.appointmentReasons.map((reason, i) => `
                <span class="badge bg-light text-dark border d-inline-flex align-items-center gap-1 px-3 py-2 appointment-reason-chip"
                  style="font-size:0.85rem;cursor:pointer;" data-index="${i}">
                  ${reason}
                  <i class="bi bi-x-circle ms-1 text-danger"></i>
                </span>
              `).join('')}
            </div>
            <div class="input-group" style="max-width: 400px;">
              <input type="text" class="form-control" id="newAppointmentReasonInput"
                placeholder="${t('settings.appointmentReasonPlaceholder', 'e.g. Consultation')}">
              <button type="button" class="btn btn-outline-primary" id="addAppointmentReasonBtn">
                <i class="bi bi-plus-lg me-1"></i>${t('settings.addAppointmentReason', 'Add Reason')}
              </button>
            </div>
            <input type="hidden" id="appointmentReasonsData" value='${JSON.stringify(settings.appointmentReasons)}'>
          </div>
        </div>

        <!-- Rejection Reasons Card -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header calendar-settings-card-header">
            <h5 class="mb-0" data-i18n="settings.rejectionReasons">${t('settings.rejectionReasons', 'Rejection Reasons')}</h5>
          </div>
          <div class="card-body">
            <p class="text-muted mb-3" data-i18n="settings.rejectionReasonsHint">
              ${t('settings.rejectionReasonsHint', 'Manage predefined reasons for rejecting appointments. Click to remove.')}
            </p>
            <div id="rejectionReasonsChips" class="d-flex flex-wrap gap-2 mb-3">
              ${settings.rejectionReasons.map((reason, i) => `
                <span class="badge bg-light text-dark border d-inline-flex align-items-center gap-1 px-3 py-2 rejection-chip"
                  style="font-size:0.85rem;cursor:pointer;" data-index="${i}">
                  ${reason}
                  <i class="bi bi-x-circle ms-1 text-danger"></i>
                </span>
              `).join('')}
            </div>
            <div class="input-group" style="max-width: 400px;">
              <input type="text" class="form-control" id="newRejectionReasonInput"
                placeholder="${t('settings.addRejectionReason', 'Add new reason...')}">
              <button type="button" class="btn btn-outline-primary" id="addRejectionReasonBtn">
                <i class="bi bi-plus-lg me-1"></i>${t('settings.addBtn', 'Add')}
              </button>
            </div>
            <input type="hidden" id="rejectionReasonsData" value='${JSON.stringify(settings.rejectionReasons)}'>
          </div>
        </div>

        <!-- Save / Reset Buttons -->
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

    <!-- Unsaved Changes Confirmation Modal -->
    <div class="modal fade" id="unsavedChangesModal" tabindex="-1" aria-labelledby="unsavedChangesModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-warning bg-warning bg-opacity-10">
            <h5 class="modal-title" id="unsavedChangesModalLabel">
              <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              <span data-i18n="settings.unsavedChangesTitle">Unsaved Changes</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p data-i18n="settings.unsavedChangesMessage">You have unsaved changes. Would you like to save them before leaving?</p>
            <div id="unsavedChangesList"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" id="unsavedDiscardBtn">
              <i class="bi bi-x-circle me-1"></i>
              <span data-i18n="settings.discardAndLeave">Discard & Leave</span>
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="unsavedStayBtn">
              <i class="bi bi-arrow-left me-1"></i>
              <span data-i18n="settings.stayOnPage">Stay</span>
            </button>
            <button type="button" class="btn btn-primary" id="unsavedSaveBtn">
              <i class="bi bi-check-circle me-1"></i>
              <span data-i18n="settings.saveAndLeave">Save & Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Confirmation Modal -->
    <div class="modal fade" id="saveConfirmModal" tabindex="-1" aria-labelledby="saveConfirmModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-primary bg-primary bg-opacity-10">
            <h5 class="modal-title" id="saveConfirmModalLabel">
              <i class="bi bi-save-fill text-primary me-2"></i>
              <span data-i18n="settings.confirmSaveTitle">Confirm Save</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p data-i18n="settings.confirmSaveMessage">Are you sure you want to save these changes?</p>
            <div id="saveConfirmChangesList"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i>
              <span data-i18n="settings.discard">Discard</span>
            </button>
            <button type="button" class="btn btn-primary" id="confirmSaveBtn">
              <i class="bi bi-check-circle me-1"></i>
              <span data-i18n="settings.save">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
