import i18next from '../../../../i18n';

const t = (key: string, fb: string) => i18next.t(key, fb);

export function renderFlagsSection(): string {
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
