import i18next from '../../../i18n';
import { renderPersonalSection } from './sections/personalSection';
import { renderIdSection } from './sections/idSection';
import { renderContactSection } from './sections/contactSection';
import { renderNzokSection } from './sections/nzokSection';
import { renderFlagsSection } from './sections/flagsSection';

const t = (key: string, fb: string) => i18next.t(key, fb);

/** Render the full New Patient registration form */
export function renderNewPatientForm(): string {
  return `
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body p-4">
        <form id="newPatientForm" novalidate>
          <div id="formValidationSummary" class="alert alert-danger d-none mb-3">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <span data-i18n="patient.validationError">${t('patient.validationError', 'Please fix the errors below')}</span>
          </div>

          ${renderPersonalSection()}
          ${renderIdSection()}
          ${renderContactSection()}
          ${renderNzokSection()}
          ${renderFlagsSection()}

          <div id="familyLinkArea" class="d-none mb-3"></div>

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
