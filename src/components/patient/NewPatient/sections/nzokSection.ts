import i18next from '../../../../i18n';
import { OBLASTS, HEALTH_REGIONS } from '../../../../data/oblasts';

const t = (key: string, fb: string) => i18next.t(key, fb);
const lang = () => (i18next.language === 'bg' ? 'bg' : 'en');

export function renderNzokSection(): string {
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
