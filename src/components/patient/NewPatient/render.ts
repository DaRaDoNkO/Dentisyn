import i18next from '../../../i18n';
import { OBLASTS, HEALTH_REGIONS } from '../../../data/oblasts';

const t = (key: string, fb: string) => i18next.t(key, fb);
const lang = () => (i18next.language === 'bg' ? 'bg' : 'en');

/** Render the full New Patient registration form */
export function renderNewPatientForm(): string {
  return `
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body p-4">
        <form id="newPatientForm" novalidate>
          <!-- Validation summary (hidden initially) -->
          <div id="formValidationSummary" class="alert alert-danger d-none mb-3">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <span data-i18n="patient.validationError">${t('patient.validationError', 'Please fix the errors below')}</span>
          </div>

          ${renderPersonalSection()}
          ${renderIdSection()}
          ${renderContactSection()}
          ${renderNzokSection()}
          ${renderFlagsSection()}

          <!-- Family link suggestion area (hidden initially) -->
          <div id="familyLinkArea" class="d-none mb-3"></div>

          <!-- Submit -->
          <div class="d-flex justify-content-end gap-2 pt-3 border-top">
            <button type="reset" class="btn btn-outline-secondary">
              <i class="bi bi-x-lg me-1"></i>
              <span data-i18n="table.cancel">${t('table.cancel', 'Cancel')}</span>
            </button>
            <button type="submit" class="btn btn-primary" id="createPatientBtn">
              <i class="bi bi-person-plus me-1"></i>
              <span data-i18n="patient.createPatient">${t('patient.createPatient', 'Create Patient')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderPersonalSection(): string {
  return `
    <h6 class="fw-bold text-primary mb-3">
      <i class="bi bi-person me-2"></i>
      <span data-i18n="patient.demographics">${t('patient.demographics', 'Demographics')}</span>
    </h6>
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <label for="npFirstName" class="form-label">
          <span data-i18n="patient.firstName">${t('patient.firstName', 'First Name')}</span>
          <span class="text-danger">*</span>
        </label>
        <input type="text" class="form-control" id="npFirstName" required>
        <div class="invalid-feedback" data-i18n="patient.required">${t('patient.required', 'This field is required')}</div>
      </div>
      <div class="col-md-4">
        <label for="npMiddleName" class="form-label">
          <span data-i18n="patient.middleName">${t('patient.middleName', 'Middle Name')}</span>
        </label>
        <input type="text" class="form-control" id="npMiddleName">
      </div>
      <div class="col-md-4">
        <label for="npFamilyName" class="form-label">
          <span data-i18n="patient.familyName">${t('patient.familyName', 'Family Name')}</span>
          <span class="text-danger">*</span>
        </label>
        <input type="text" class="form-control" id="npFamilyName" required>
        <div class="invalid-feedback" data-i18n="patient.required">${t('patient.required', 'This field is required')}</div>
      </div>
    </div>
  `;
}

function renderIdSection(): string {
  return `
    <h6 class="fw-bold text-primary mb-3">
      <i class="bi bi-card-text me-2"></i>
      <span data-i18n="patient.idInfo">${t('patient.idInfo', 'ID Information')}</span>
    </h6>
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <label for="npIdType" class="form-label">
          <span data-i18n="patient.idType">${t('patient.idType', 'ID Type')}</span>
        </label>
        <select class="form-select" id="npIdType">
          <option value="EGN" data-i18n="patient.egn">${t('patient.egn', 'EGN')}</option>
          <option value="LNCh" data-i18n="patient.lnch">${t('patient.lnch', 'LNCh')}</option>
          <option value="EU" data-i18n="patient.euCitizen">${t('patient.euCitizen', 'EU Citizen')}</option>
          <option value="SSN" data-i18n="patient.ssn">${t('patient.ssn', 'SSN')}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="npIdNumber" class="form-label">
          <span data-i18n="patient.idNumber">${t('patient.idNumber', 'ID Number')}</span>
          <span class="text-danger">*</span>
        </label>
        <input type="text" class="form-control" id="npIdNumber" required>
        <div class="invalid-feedback" id="npIdNumberError"></div>
      </div>
      <div class="col-md-3">
        <label for="npDob" class="form-label">
          <span data-i18n="patient.dateOfBirth">${t('patient.dateOfBirth', 'Date of Birth')}</span>
        </label>
        <input type="date" class="form-control" id="npDob">
        <small id="npDobAutoFill" class="text-success d-none">
          <i class="bi bi-check-circle me-1"></i>
          <span data-i18n="patient.autoFilledFromEgn">${t('patient.autoFilledFromEgn', 'Auto-filled from EGN')}</span>
        </small>
      </div>
      <div class="col-md-3">
        <label for="npSex" class="form-label">
          <span data-i18n="patient.sex">${t('patient.sex', 'Sex')}</span>
        </label>
        <select class="form-select" id="npSex">
          <option value="">—</option>
          <option value="male" data-i18n="patient.male">${t('patient.male', 'Male')}</option>
          <option value="female" data-i18n="patient.female">${t('patient.female', 'Female')}</option>
        </select>
        <small id="npSexAutoFill" class="text-success d-none">
          <i class="bi bi-check-circle me-1"></i>
          <span data-i18n="patient.autoFilledFromEgn">${t('patient.autoFilledFromEgn', 'Auto-filled from EGN')}</span>
        </small>
      </div>
    </div>
  `;
}

function renderContactSection(): string {
  return `
    <h6 class="fw-bold text-primary mb-3">
      <i class="bi bi-telephone me-2"></i>
      <span data-i18n="patient.contactInfo">${t('patient.contactInfo', 'Contact Information')}</span>
    </h6>
    <div class="row g-3 mb-4">
      <div class="col-md-2">
        <label for="npCountryCode" class="form-label">
          <span data-i18n="patient.countryCode">${t('patient.countryCode', 'Code')}</span>
        </label>
        <select class="form-select" id="npCountryCode">
          <option value="+359">+359</option>
          <option value="+49">+49</option>
          <option value="+44">+44</option>
          <option value="+1">+1</option>
          <option value="+33">+33</option>
          <option value="+39">+39</option>
          <option value="+34">+34</option>
        </select>
      </div>
      <div class="col-md-4">
        <label for="npPhone" class="form-label">
          <span data-i18n="patient.phone">${t('patient.phone', 'Phone')}</span>
          <span class="text-danger">*</span>
        </label>
        <input type="tel" class="form-control" id="npPhone" required
          placeholder="888 123 456">
        <div class="invalid-feedback" data-i18n="patient.invalidPhone">${t('patient.invalidPhone', 'Invalid phone number')}</div>
      </div>
      <div class="col-md-6">
        <label for="npEmail" class="form-label">
          <span data-i18n="patient.email">${t('patient.email', 'Email')}</span>
        </label>
        <input type="email" class="form-control" id="npEmail">
        <div class="invalid-feedback" data-i18n="patient.invalidEmail">${t('patient.invalidEmail', 'Invalid email address')}</div>
      </div>
      <div class="col-12">
        <label for="npAddress" class="form-label">
          <span data-i18n="patient.address">${t('patient.address', 'Address')}</span>
        </label>
        <input type="text" class="form-control" id="npAddress">
      </div>
    </div>
  `;
}

function renderNzokSection(): string {
  const oblastOptions = OBLASTS.map(o => {
    const label = lang() === 'bg' ? o.nameBG : o.nameEN;
    return `<option value="${o.code}">${label}</option>`;
  }).join('');

  const regionOptions = HEALTH_REGIONS.map(r => {
    const label = lang() === 'bg' ? r.nameBG : r.nameEN;
    return `<option value="${r.code}">${label}</option>`;
  }).join('');

  return `
    <h6 class="fw-bold text-primary mb-3">
      <i class="bi bi-hospital me-2"></i>
      <span data-i18n="patient.nzokSection">${t('patient.nzokSection', 'NZOK Information')}</span>
    </h6>
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <label for="npNzokNumber" class="form-label">
          <span data-i18n="patient.nzokNumber">${t('patient.nzokNumber', 'NZOK Number')}</span>
        </label>
        <input type="text" class="form-control" id="npNzokNumber">
      </div>
      <div class="col-md-4">
        <label for="npRzokOblast" class="form-label">
          <span data-i18n="patient.rzokOblast">${t('patient.rzokOblast', 'RZOK Oblast')}</span>
        </label>
        <select class="form-select" id="npRzokOblast">
          <option value="" data-i18n="patient.selectOblast">${t('patient.selectOblast', 'Select oblast...')}</option>
          ${oblastOptions}
        </select>
      </div>
      <div class="col-md-4">
        <label for="npHealthRegion" class="form-label">
          <span data-i18n="patient.healthRegion">${t('patient.healthRegion', 'Health Region')}</span>
        </label>
        <select class="form-select" id="npHealthRegion">
          <option value="" data-i18n="patient.selectRegion">${t('patient.selectRegion', 'Select health region...')}</option>
          ${regionOptions}
        </select>
      </div>
    </div>
  `;
}

function renderFlagsSection(): string {
  return `
    <h6 class="fw-bold text-primary mb-3">
      <i class="bi bi-flag me-2"></i>
      <span data-i18n="patient.patientFlags">${t('patient.patientFlags', 'Patient Flags')}</span>
    </h6>
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="npUnfavorable">
          <label class="form-check-label" for="npUnfavorable"
            data-i18n="patient.unfavorableConditions">
            ${t('patient.unfavorableConditions', 'Unfavorable Conditions')}
          </label>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="npExemptFee">
          <label class="form-check-label" for="npExemptFee"
            data-i18n="patient.exemptFromFee">
            ${t('patient.exemptFromFee', 'Exempt from Fee')}
          </label>
        </div>
      </div>
      <div class="col-md-4">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="npPensioner">
          <label class="form-check-label" for="npPensioner"
            data-i18n="patient.pensioner">
            ${t('patient.pensioner', 'Pensioner')}
          </label>
        </div>
      </div>
    </div>
  `;
}
