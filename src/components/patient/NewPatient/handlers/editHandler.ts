/**
 * Edit mode initialization and UI setup
 */

import { patientRepository } from '../../../../repositories/patientRepository';
import { FORM_IDS } from '../constants/formFields';
import { 
  setFieldValue, 
  setCheckboxValue, 
  setSelectValue
} from '../utils/domHelpers';
import i18next from '../../../../i18n';

const t = (key: string, fb: string) => i18next.t(key, fb);

export const prefillFormWithPatient = (patientId: string): void => {
  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  // Name fields — prefer stored per-field values, fall back to splitting combined name
  const parts = patient.name.split(' ');
  setFieldValue(FORM_IDS.firstName, parts[0] ?? '');
  setFieldValue(FORM_IDS.middleName, patient.middleName ?? (parts.length === 3 ? parts[1] : ''));
  setFieldValue(FORM_IDS.familyName, patient.familyName ?? parts[parts.length - 1] ?? '');

  // Phone — split stored country code from number
  const phone = patient.phone ?? '';
  const codeMatch = phone.match(/^(\+\d{1,4})/);
  if (codeMatch) {
    setSelectValue(FORM_IDS.countryCode, codeMatch[1]);
    setFieldValue(FORM_IDS.phone, phone.slice(codeMatch[1].length).trim());
  } else {
    setFieldValue(FORM_IDS.phone, phone);
  }

  // Email, address, ID details
  setFieldValue(FORM_IDS.email, patient.email ?? '');
  setFieldValue(FORM_IDS.address, patient.address ?? '');
  setSelectValue(FORM_IDS.idType, patient.idType ?? 'EGN');
  setFieldValue(FORM_IDS.idNumber, patient.idNumber ?? '');
  setFieldValue(FORM_IDS.dob, patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '');

  // Sex, health info
  setSelectValue(FORM_IDS.sex, patient.sex ?? '');
  setFieldValue(FORM_IDS.nzokNumber, patient.nzokNumber ?? '');
  setSelectValue(FORM_IDS.rzokOblast, patient.rzokOblast ?? '');
  setSelectValue(FORM_IDS.healthRegion, patient.healthRegion ?? '');

  // Checkboxes
  setCheckboxValue(FORM_IDS.unfavorable, patient.unfavorableConditions ?? false);
  setCheckboxValue(FORM_IDS.exemptFee, patient.exemptFromFee ?? false);
  setCheckboxValue(FORM_IDS.pensioner, patient.pensioner ?? false);
};

export const setupEditModeUI = (patientId: string): void => {
  // Change submit button to "Save Changes"
  const submitBtn = document.getElementById(FORM_IDS.createBtn);
  if (submitBtn) {
    submitBtn.innerHTML =
      '<i class="bi bi-floppy me-1"></i>' +
      `<span data-i18n="patient.saveChanges">${t('patient.saveChanges', 'Save Changes')}</span>`;
  }

  // Change Cancel button to dispatch editCancelled
  const cancelBtn = document.querySelector(`#${FORM_IDS.form} button[type="reset"]`) as HTMLButtonElement | null;
  if (cancelBtn) {
    cancelBtn.type = 'button';
    cancelBtn.addEventListener('click', () => {
      document.dispatchEvent(
        new CustomEvent('patient:editCancelled', { detail: { patientId } })
      );
    });
  }
};
