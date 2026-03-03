/**
 * Form validation logic
 */

import { validateEGN, validateLNCh } from '../../../../utils/bgUtils';
import i18next from '../../../../i18n';
import type { NewPatientFormData, FormValidationErrors } from '../types';
import { FORM_IDS, FIELD_MAP } from '../constants/formFields';
import { markFieldInvalid, clearFieldValidation } from '../utils/domHelpers';

const t = (key: string, fb: string) => i18next.t(key, fb);

export const validateFormData = (data: NewPatientFormData): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!data.firstName) errors.firstName = t('patient.required', 'Required');
  if (!data.familyName) errors.familyName = t('patient.required', 'Required');
  if (!data.phone) errors.phone = t('patient.invalidPhone', 'Invalid phone');

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = t('patient.invalidEmail', 'Invalid email');
  }

  // Validate ID number based on type
  if (data.idNumber) {
    if (data.idType === 'EGN') {
      const r = validateEGN(data.idNumber);
      if (!r.valid) errors.idNumber = t('patient.invalidEgn', 'Invalid EGN');
    } else if (data.idType === 'LNCh') {
      const r = validateLNCh(data.idNumber);
      if (!r.valid) errors.idNumber = t('patient.invalidLnch', 'Invalid LNCh');
    }
  }

  return errors;
};

export const displayValidationErrors = (errors: FormValidationErrors): void => {
  // Show summary for duplicate errors
  const summary = document.getElementById(FORM_IDS.validationSummary);
  if (summary) {
    if (errors.duplicate) {
      summary.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${errors.duplicate}`;
    }
    summary.classList.remove('d-none');
  }

  // Mark invalid fields
  for (const [field, inputId] of Object.entries(FIELD_MAP)) {
    if (errors[field as keyof FormValidationErrors]) {
      markFieldInvalid(inputId);
    } else {
      clearFieldValidation(inputId);
    }
  }
};

export const validateEgnFormat = (egn: string): boolean => {
  const result = validateEGN(egn);
  return result.valid;
};

export const validateLnchFormat = (lnch: string): boolean => {
  const result = validateLNCh(lnch);
  return result.valid;
};
