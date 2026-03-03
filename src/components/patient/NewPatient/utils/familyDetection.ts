/**
 * Family detection and linking logic
 */

import { patientRepository } from '../../../../repositories/patientRepository';
import { showToast } from '../../../../utils/toast';
import i18next from '../../../../i18n';
import type { FamilySuggestion } from '../types';
import { FORM_IDS, FAMILY_DEBOUNCE_MS } from '../constants/formFields';
import { hideElement, showElement } from './domHelpers';
import { renderFamilySuggestions } from '../templates/familySuggestions';
import { setupFamilyLinkHandlers } from '../handlers/submissionHandler';

const t = (key: string, fb: string) => i18next.t(key, fb);

export let selectedFamilyGroupId = '';

export const setSelectedFamilyGroupId = (id: string): void => {
  selectedFamilyGroupId = id;
};

export const setupFamilyDetection = (): void => {
  const familyNameInput = document.getElementById(FORM_IDS.familyName) as HTMLInputElement | null;
  const phoneInput = document.getElementById(FORM_IDS.phone) as HTMLInputElement | null;

  let debounceTimer: ReturnType<typeof setTimeout>;

  const check = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkFamilyLinks(
        familyNameInput?.value.trim() ?? '',
        phoneInput?.value.trim() ?? ''
      );
    }, FAMILY_DEBOUNCE_MS);
  };

  familyNameInput?.addEventListener('input', check);
  phoneInput?.addEventListener('input', check);
};

export const checkFamilyLinks = (familyName: string, phone: string): void => {
  const area = document.getElementById(FORM_IDS.familyLinkArea);
  if (!area) return;

  if (!familyName && !phone) {
    hideElement(FORM_IDS.familyLinkArea);
    area.innerHTML = '';
    return;
  }

  const allPatients = patientRepository.getAll();
  const suggestions: FamilySuggestion[] = [];

  for (const p of allPatients) {
    if (familyName && p.familyName?.toLowerCase() === familyName.toLowerCase()) {
      suggestions.push({
        patientId: p.id,
        name: p.name,
        phone: p.phone,
        reason: 'sameFamilyName'
      });
    } else if (phone && phone.length >= 6 && p.phone.includes(phone)) {
      suggestions.push({
        patientId: p.id,
        name: p.name,
        phone: p.phone,
        reason: 'samePhone'
      });
    }
  }

  if (suggestions.length === 0) {
    hideElement(FORM_IDS.familyLinkArea);
    area.innerHTML = '';
    return;
  }

  showElement(FORM_IDS.familyLinkArea);
  area.innerHTML = renderFamilySuggestions(suggestions);
  setupFamilyLinkHandlers();
};

export const linkPatientToFamily = (patientId: string): void => {
  const patient = patientRepository.getById(patientId);

  if (patient) {
    // Use existing group or create new
    selectedFamilyGroupId = patient.familyGroupId ?? `family-${Date.now()}`;

    // Update the existing patient's group if not set
    if (!patient.familyGroupId) {
      patientRepository.update(patientId, {
        familyGroupId: selectedFamilyGroupId
      });
    }

    showToast({
      message: t('patient.familyLinked', 'Patient linked to family group'),
      type: 'success',
      duration: 3000
    });
  }
};
