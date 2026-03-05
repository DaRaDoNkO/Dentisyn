import i18next from '../../../../i18n';

const t = (key: string, fb: string) => i18next.t(key, fb);

export function renderPersonalSection(): string {
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
