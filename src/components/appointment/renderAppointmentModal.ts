/**
 * Appointment modal HTML template renderer
 */

import i18next from '../../i18n';
import { COUNTRY_CODES } from './constants';
import { generateTimeOptions } from './timeUtils';
import { loadCalendarSettings } from '../user/Settings/CalendarSettings/index';
import { toInputDate } from '../../utils/dateUtils';

const t = (key: string, fb: string): string => i18next.t(key, fb) as string;

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
                  ${t('appointment.patientName', 'Patient Name')}
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="patientNameSearch"
                  placeholder="${t('appointment.typeaheadSearchPlaceholder', 'Type to search or create a new patient...')}"
                  autocomplete="off"
                >
                <small class="text-muted d-block mt-1" data-i18n="appointment.typeaheadHint">
                  ${t('appointment.typeaheadHint', 'Start typing to search existing patients')}
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
                  <i class="bi bi-pencil"></i>
                  <span data-i18n="appointment.changePatient">${t('appointment.changePatient', 'Change')}</span>
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
                      <label for="patientFirstName" class="form-label" data-i18n="patient.firstName">${t('patient.firstName', 'First Name')}</label>
                      <input type="text" class="form-control" id="patientFirstName" required>
                    </div>
                    <!-- Last Name -->
                    <div class="col-md-6 mb-3">
                      <label for="patientLastName" class="form-label" data-i18n="patient.familyName">${t('patient.familyName', 'Family Name')}</label>
                      <input type="text" class="form-control" id="patientLastName" required>
                    </div>
                  </div>
                  
                  <!-- Smart Phone Input (Split: Country Code + Number) -->
                  <div class="mb-3">
                    <label class="form-label" data-i18n="patient.phone">${t('patient.phone', 'Phone')}</label>
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
                    <small class="text-muted" data-i18n="appointment.phoneHint">${t('appointment.phoneHint', 'Numbers only (no spaces or dashes)')}</small>
                  </div>
                  
                  <!-- ID Type and Number -->
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="patientIDType" class="form-label" data-i18n="patient.idType">${t('patient.idType', 'ID Type')}</label>
                      <select class="form-select" id="patientIDType">
                        <option value="EGN" selected data-i18n="patient.egn">${t('patient.egn', 'EGN')}</option>
                        <option value="LNCh" data-i18n="patient.lnch">${t('patient.lnch', 'LNCh')}</option>
                        <option value="EU" data-i18n="patient.euCitizen">${t('patient.euCitizen', 'EU Citizen')}</option>
                        <option value="SSN" data-i18n="patient.ssn">${t('patient.ssn', 'SSN')}</option>
                      </select>
                      <small class="text-muted" data-i18n="appointment.autoDetects">${t('appointment.autoDetects', 'Auto-detects')}</small>
                    </div>
                    <div class="col-md-8 mb-3">
                      <label for="patientIDNumber" class="form-label" data-i18n="patient.idNumber">${t('patient.idNumber', 'ID Number')}</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="patientIDNumber" 
                        placeholder="${t('appointment.idPlaceholder', 'Enter EGN, LNCh or Passport number')}"
                        maxlength="20"
                      >
                      <small id="idValidationFeedback" class="text-muted"></small>
                    </div>
                  </div>
                  
                  <!-- Date of Birth and Sex (auto-filled for EGN) -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="patientDOB" class="form-label" data-i18n="patient.dateOfBirth">${t('patient.dateOfBirth', 'Date of Birth')}</label>
                      <input type="date" class="form-control" id="patientDOB">
                      <small class="text-muted" data-i18n="appointment.autoFilledForEgn">${t('appointment.autoFilledForEgn', 'Auto-filled for EGN')}</small>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="patientSex" class="form-label" data-i18n="patient.sex">${t('patient.sex', 'Sex')}</label>
                      <select class="form-select" id="patientSex">
                        <option value="" data-i18n="appointment.selectSex">${t('appointment.selectSex', 'Select...')}</option>
                        <option value="m" data-i18n="patient.male">${t('patient.male', 'Male')}</option>
                        <option value="f" data-i18n="patient.female">${t('patient.female', 'Female')}</option>
                      </select>
                      <small class="text-muted" data-i18n="appointment.autoFilledForEgn">${t('appointment.autoFilledForEgn', 'Auto-filled for EGN')}</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date & Time (MOVED UP) -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="appointmentDate" class="form-label fw-bold" data-i18n="appointment.date">${t('appointment.date', 'Date')}</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="appointmentDate" 
                    value="${toInputDate(clickedDate)}"
                    required
                  >
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentStartTime" class="form-label fw-bold" data-i18n="appointment.startTime">${t('appointment.startTime', 'Start Time')}</label>
                  <select class="form-select" id="appointmentStartTime" required>
                    ${timeOptions.split('\n').map(opt => {
    const match = opt.match(/value="([^"]+)"/);
    const value = match ? match[1] : '';
    return opt.replace('<option', `<option${value === startTimeValue ? ' selected' : ''}`);
  }).join('\n')}
                  </select>
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentEndTime" class="form-label fw-bold" data-i18n="appointment.endTime">${t('appointment.endTime', 'End Time')}</label>
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
                <label for="doctorSelect" class="form-label fw-bold" data-i18n="appointment.assignDoctor">${t('appointment.assignDoctor', 'Assign Doctor')}</label>
                <select class="form-select" id="doctorSelect" required>
                  <option value="" disabled selected data-i18n="appointment.selectTimeFirst">${t('appointment.selectTimeFirst', 'Select time first...')}</option>
                </select>
                <small class="text-muted" id="doctorAvailabilityHint" data-i18n="appointment.doctorHint">${t('appointment.doctorHint', 'Available doctors will appear based on selected time')}</small>
              </div>

              <!-- Reason/Notes (OPTIONAL) -->
              <div class="mb-3">
                <label for="appointmentReason" class="form-label">
                  <span data-i18n="appointment.reasonNotes">${t('appointment.reasonNotes', 'Reason / Notes')}</span>
                  <span class="badge bg-secondary ms-2" data-i18n="appointment.optional">${t('appointment.optional', 'Optional')}</span>
                </label>
                <textarea 
                  class="form-control" 
                  id="appointmentReason" 
                  rows="3" 
                  placeholder="${t('appointment.reasonPlaceholder', 'e.g., Regular checkup, Cleaning, Root canal...')}"
                ></textarea>
                <small class="text-muted" data-i18n="appointment.leaveBlank">${t('appointment.leaveBlank', 'Leave blank if not specified')}</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i> <span data-i18n="appointment.cancel"></span>
            </button>
            <button type="button" class="btn btn-primary" id="saveAppointmentBtn">
              <i class="bi bi-check-circle me-1"></i> <span data-i18n="appointment.save"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
