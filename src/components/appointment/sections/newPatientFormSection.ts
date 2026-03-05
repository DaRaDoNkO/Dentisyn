import i18next from '../../../i18n';
import { COUNTRY_CODES } from '../constants';

const t = (key: string, fb: string): string => i18next.t(key, fb) as string;

/** Renders the new/edit patient inline form HTML */
export function renderNewPatientFormSection(): string {
  return `
    <div id="newPatientForm" style="display:none;">
      <div class="border-top pt-3 mb-3">
        <h6 class="text-primary mb-3">
          <i class="bi bi-person-plus me-2"></i>
          <span id="patientFormTitle" data-i18n="appointment.newPatientDetails">New Patient Details</span>
        </h6>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="patientFirstName" class="form-label" data-i18n="patient.firstName">${t('patient.firstName', 'First Name')}</label>
            <input type="text" class="form-control" id="patientFirstName" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="patientLastName" class="form-label" data-i18n="patient.familyName">${t('patient.familyName', 'Family Name')}</label>
            <input type="text" class="form-control" id="patientLastName" required>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" data-i18n="patient.phone">${t('patient.phone', 'Phone')}</label>
          <div class="input-group">
            <input type="text" class="form-control" id="patientCountryCode" list="countryCodeList" placeholder="+359" value="+359" style="max-width:100px;">
            <input type="tel" class="form-control" id="patientPhoneNumber" placeholder="888123456" required>
          </div>
          <datalist id="countryCodeList">
            ${COUNTRY_CODES.map(c => `<option value="${c.code}">${c.country}</option>`).join('')}
          </datalist>
          <small class="text-muted" data-i18n="appointment.phoneHint">${t('appointment.phoneHint', 'Numbers only (no spaces or dashes)')}</small>
        </div>
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
            <input type="text" class="form-control" id="patientIDNumber" placeholder="${t('appointment.idPlaceholder', 'Enter EGN, LNCh or Passport number')}" maxlength="20">
            <small id="idValidationFeedback" class="text-muted"></small>
          </div>
        </div>
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
  `;
}
