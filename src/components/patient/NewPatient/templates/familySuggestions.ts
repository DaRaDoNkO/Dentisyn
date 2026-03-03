/**
 * Family suggestions rendering templates
 */

import i18next from '../../../../i18n';
import type { FamilySuggestion } from '../types';

const t = (key: string, fb: string) => i18next.t(key, fb);

export const renderFamilySuggestions = (suggestions: FamilySuggestion[]): string => {
  const items = suggestions.map(s => `
    <div class="d-flex align-items-center justify-content-between py-1">
      <span>
        <i class="bi bi-people-fill text-primary me-1"></i>
        <strong>${s.name}</strong>
        <small class="text-muted ms-2">${s.phone}</small>
        <span class="badge bg-info-subtle text-info ms-2">
          ${s.reason === 'sameFamilyName' ? 'Same family name' : 'Same phone'}
        </span>
      </span>
      <button type="button" class="btn btn-sm btn-outline-primary family-link-btn"
        data-patient-id="${s.patientId}">
        <i class="bi bi-link-45deg me-1"></i>
        <span data-i18n="patient.linkFamily">${t('patient.linkFamily', 'Link as Family Member')}</span>
      </button>
    </div>
  `).join('');

  return `
    <div class="alert alert-info mb-0">
      <h6 class="alert-heading mb-2">
        <i class="bi bi-people me-2"></i>
        <span data-i18n="patient.familyLinkSuggestion">
          ${t('patient.familyLinkSuggestion', 'Possible family members found')}
        </span>
      </h6>
      ${items}
    </div>
  `;
};
