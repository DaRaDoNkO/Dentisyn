import i18next from '../../../../i18n';

const t = (key: string, fb: string) => i18next.t(key, fb);

export function renderIdSection(): string {
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
