/**
 * Appointment modal HTML template renderer
 */

import { COUNTRY_CODES } from './constants';
import { generateTimeOptions } from './timeUtils';
import { loadCalendarSettings } from '../user/Settings/CalendarSettings/index';

/**
 * Render the appointment modal HTML
 * @param clickedDateISO - ISO date string for the clicked date
 * @returns HTML string for the modal
 */
export const renderAppointmentModal = (clickedDateISO: string): string => {
  const clickedDate = new Date(clickedDateISO);
  const defaultEndTime = new Date(clickedDate.getTime() + 30 * 60000); // 30 min duration

  // Load user's time format preference
  const settings = loadCalendarSettings();
  const is24h = settings.timeFormat === '24h';

  // Generate time options (8 AM to 8 PM)
  const timeOptions = generateTimeOptions(8, 20, 15, is24h);

  // Get default selected times
  const startTimeValue = `${String(clickedDate.getHours()).padStart(2, '0')}:${String(clickedDate.getMinutes()).padStart(2, '0')}`;
  const endTimeValue = `${String(defaultEndTime.getHours()).padStart(2, '0')}:${String(defaultEndTime.getMinutes()).padStart(2, '0')}`;

  return `
    <div class="modal fade" id="appointmentModal" tabindex="-1" aria-labelledby="appointmentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="appointmentModalLabel" data-i18n="appointment.newAppointment">New Appointment</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="appointmentForm">
              <!-- Smart Patient Search (Typeahead) -->
              <div class="mb-3">
                <label for="patientNameSearch" class="form-label fw-bold" data-i18n="appointment.patientName">
                  Patient Name
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="patientNameSearch"
                  placeholder="Type to search or create new patient..."
                  autocomplete="off"
                >
                <small class="text-muted d-block mt-1" data-i18n="appointment.typeaheadHint">
                  Start typing to search existing patients
                </small>
                
                <!-- Typeahead Dropdown -->
                <div id="patientTypeaheadDropdown" class="dropdown-menu w-100" style="display: none; max-height: 300px; overflow-y: auto;">
                  <!-- Results populated dynamically -->
                </div>
              </div>

              <!-- Selected Patient Display -->
              <div id="selectedPatientInfo" class="alert alert-info d-flex justify-content-between align-items-center" style="display: none;">
                <div>
                  <strong id="selectedPatientName"></strong><br>
                  <small id="selectedPatientDetails" class="text-muted"></small>
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="changePatientBtn">
                  <i class="bi bi-pencil"></i> Change
                </button>
              </div>

              <!-- New/Edit Patient Form (hidden initially) -->
              <div id="newPatientForm" style="display: none;">
                <div class="border-top pt-3 mb-3">
                  <h6 class="text-primary mb-3">
                    <i class="bi bi-person-plus me-2"></i>
                    <span id="patientFormTitle" data-i18n="appointment.newPatientDetails">New Patient Details</span>
                  </h6>
                  
                  <div class="row">
                    <!-- First Name -->
                    <div class="col-md-6 mb-3">
                      <label for="patientFirstName" class="form-label">First Name</label>
                      <input type="text" class="form-control" id="patientFirstName" required>
                    </div>
                    <!-- Last Name -->
                    <div class="col-md-6 mb-3">
                      <label for="patientLastName" class="form-label">Last Name</label>
                      <input type="text" class="form-control" id="patientLastName" required>
                    </div>
                  </div>
                  
                  <!-- Smart Phone Input (Split: Country Code + Number) -->
                  <div class="mb-3">
                    <label class="form-label">Phone Number</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        id="patientCountryCode"
                        list="countryCodeList"
                        placeholder="+359"
                        value="+359"
                        style="max-width: 100px;"
                      >
                      <input
                        type="tel"
                        class="form-control"
                        id="patientPhoneNumber"
                        placeholder="888123456"
                        required
                      >
                    </div>
                    <datalist id="countryCodeList">
                      ${COUNTRY_CODES.map(
    (c) => `<option value="${c.code}">${c.country}</option>`
  ).join('')}
                    </datalist>
                    <small class="text-muted">Numbers only (no spaces or dashes)</small>
                  </div>
                  
                  <!-- ID Type and Number -->
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="patientIDType" class="form-label">ID Type</label>
                      <select class="form-select" id="patientIDType">
                        <option value="egn" selected>BG (EGN)</option>
                        <option value="lnch">LNCh (Resident)</option>
                        <option value="foreign">Foreign</option>
                      </select>
                      <small class="text-muted">Auto-detects</small>
                    </div>
                    <div class="col-md-8 mb-3">
                      <label for="patientIDNumber" class="form-label">ID Number</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="patientIDNumber" 
                        placeholder="Enter EGN, LNCh, or Passport"
                        maxlength="20"
                      >
                      <small id="idValidationFeedback" class="text-muted"></small>
                    </div>
                  </div>
                  
                  <!-- Date of Birth and Sex (auto-filled for EGN) -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="patientDOB" class="form-label">Date of Birth</label>
                      <input type="date" class="form-control" id="patientDOB">
                      <small class="text-muted">Auto-filled for EGN</small>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="patientSex" class="form-label">Sex</label>
                      <select class="form-select" id="patientSex">
                        <option value="">Select...</option>
                        <option value="m">Male</option>
                        <option value="f">Female</option>
                      </select>
                      <small class="text-muted">Auto-filled for EGN</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date & Time (MOVED UP) -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="appointmentDate" class="form-label fw-bold">Date</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="appointmentDate" 
                    value="${clickedDate.toISOString().split('T')[0]}"
                    required
                  >
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentStartTime" class="form-label fw-bold">Start Time</label>
                  <select class="form-select" id="appointmentStartTime" required>
                    ${timeOptions.split('\n').map(opt => {
    const match = opt.match(/value="([^"]+)"/);
    const value = match ? match[1] : '';
    return opt.replace('<option', `<option${value === startTimeValue ? ' selected' : ''}`);
  }).join('\n')}
                  </select>
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentEndTime" class="form-label fw-bold">End Time</label>
                  <select class="form-select" id="appointmentEndTime" required>
                    ${timeOptions.split('\n').map(opt => {
    const match = opt.match(/value="([^"]+)"/);
    const value = match ? match[1] : '';
    return opt.replace('<option', `<option${value === endTimeValue ? ' selected' : ''}`);
  }).join('\n')}
                  </select>
                </div>
              </div>

              <!-- Doctor Selection (MOVED AFTER TIME) -->
              <div class="mb-3">
                <label for="doctorSelect" class="form-label fw-bold" data-i18n="appointment.assignDoctor">Assign Doctor</label>
                <select class="form-select" id="doctorSelect" required>
                  <option value="" disabled selected>Select time first...</option>
                </select>
                <small class="text-muted" id="doctorAvailabilityHint">Available doctors will appear based on selected time</small>
              </div>

              <!-- Reason/Notes (OPTIONAL) -->
              <div class="mb-3">
                <label for="appointmentReason" class="form-label">
                  Reason / Notes 
                  <span class="badge bg-secondary ms-2">Optional</span>
                </label>
                <textarea 
                  class="form-control" 
                  id="appointmentReason" 
                  rows="3" 
                  placeholder="e.g., Regular checkup, Cleaning, Root canal..."
                ></textarea>
                <small class="text-muted">Leave blank if not specified</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i> Cancel
            </button>
            <button type="button" class="btn btn-primary" id="saveAppointmentBtn">
              <i class="bi bi-check-circle me-1"></i> Save Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
