/**
 * EGN and LNCh auto-fill logic
 */

import { validateEGN, validateLNCh } from '../../../../utils/bgUtils';
import { toInputDate } from '../../../../utils/dateUtils';
import i18next from '../../../../i18n';
import type { PatientIdType } from '../../../../types/patient';
import { FORM_IDS, EGN_LENGTH, LNCH_LENGTH } from '../constants/formFields';
import { 
  markFieldInvalid, 
  markFieldValid, 
  clearFieldValidation, 
  setErrorText, 
  hideElement, 
  showElement 
} from './domHelpers';

const t = (key: string, fb: string) => i18next.t(key, fb);

export const setupEgnAutoFill = (): void => {
  const idTypeSelect = document.getElementById(FORM_IDS.idType) as HTMLSelectElement | null;
  const idNumberInput = document.getElementById(FORM_IDS.idNumber) as HTMLInputElement | null;

  if (!idNumberInput) return;

  // On ID number change, validate and auto-fill
  idNumberInput.addEventListener('input', () => {
    const idType = idTypeSelect?.value as PatientIdType ?? 'EGN';
    const value = idNumberInput.value.trim();

    clearFieldValidation(FORM_IDS.idNumber);

    if (idType === 'EGN' && value.length === EGN_LENGTH) {
      handleEgnAutoFill(value);
    } else if (idType === 'LNCh' && value.length === LNCH_LENGTH) {
      handleLnchValidation(value);
    }
  });

  // Re-validate when ID type changes
  idTypeSelect?.addEventListener('change', () => {
    const value = idNumberInput.value.trim();
    clearFieldValidation(FORM_IDS.idNumber);
    clearAutoFillIndicators();

    const idType = idTypeSelect.value as PatientIdType;
    if (idType === 'EGN' && value.length === EGN_LENGTH) {
      handleEgnAutoFill(value);
    } else if (idType === 'LNCh' && value.length === LNCH_LENGTH) {
      handleLnchValidation(value);
    }
  });
};

export const handleEgnAutoFill = (egn: string): void => {
  const result = validateEGN(egn);

  if (!result.valid) {
    markFieldInvalid(FORM_IDS.idNumber);
    setErrorText(`${FORM_IDS.idNumber}Error`, t('patient.invalidEgn', 'Invalid EGN'));
    return;
  }

  markFieldValid(FORM_IDS.idNumber);

  // Auto-fill DOB
  if (result.dob) {
    const dobInput = document.getElementById(FORM_IDS.dob) as HTMLInputElement | null;
    if (dobInput) {
      dobInput.value = toInputDate(result.dob);
      showElement(FORM_IDS.dobAutoFill);
    }
  }

  // Auto-fill Sex
  if (result.sex) {
    const sexSelect = document.getElementById(FORM_IDS.sex) as HTMLSelectElement | null;
    if (sexSelect) {
      sexSelect.value = result.sex === 'm' ? 'male' : 'female';
      showElement(FORM_IDS.sexAutoFill);
    }
  }
};

export const handleLnchValidation = (lnch: string): void => {
  const result = validateLNCh(lnch);

  if (!result.valid) {
    markFieldInvalid(FORM_IDS.idNumber);
    setErrorText(`${FORM_IDS.idNumber}Error`, t('patient.invalidLnch', 'Invalid LNCh'));
  } else {
    markFieldValid(FORM_IDS.idNumber);
  }
};

export const clearAutoFillIndicators = (): void => {
  hideElement(FORM_IDS.dobAutoFill);
  hideElement(FORM_IDS.sexAutoFill);
};
