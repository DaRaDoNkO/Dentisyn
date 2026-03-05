import { patientRepository } from '../../../../repositories/patientRepository';
import { showToast } from '../../../../utils/toast';
import i18next from '../../../../i18n';
import { FORM_IDS } from '../constants/formFields';
import { hideElement } from '../utils/domHelpers';
import { validateFormData, displayValidationErrors } from '../validators/formValidator';
import { selectedFamilyGroupId, setSelectedFamilyGroupId } from '../utils/familyDetection';
export { collectFormData } from './formDataCollector';
export { setupFamilyLinkHandlers } from './familyLinkHandlers';
import { collectFormData } from './formDataCollector';

const t = (key: string, fb: string) => i18next.t(key, fb);

export const setupFormSubmission = (editPatientId?: string): void => {
  const form = document.getElementById(FORM_IDS.form) as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(editPatientId);
  });

  // Reset listener only in create mode
  if (!editPatientId) {
    form.addEventListener('reset', () => {
      setTimeout(() => {
        form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
          el.classList.remove('is-invalid', 'is-valid');
        });
        hideElement(FORM_IDS.dobAutoFill);
        hideElement(FORM_IDS.sexAutoFill);
        hideElement(FORM_IDS.familyLinkArea);
        hideElement(FORM_IDS.validationSummary);
        setSelectedFamilyGroupId('');
      }, 0);
    });
  }
};

export const handleFormSubmit = (editPatientId?: string): void => {
  const data = collectFormData();
  const errors = validateFormData(data);

  if (Object.keys(errors).length > 0) {
    displayValidationErrors(errors);
    return;
  }

  const fullName = [data.firstName, data.middleName, data.familyName]
    .filter(Boolean).join(' ');
  const fullPhone = `${data.countryCode}${data.phone}`;

  // ── Edit mode: update existing patient ──
  if (editPatientId) {
    patientRepository.update(editPatientId, {
      name: fullName,
      phone: fullPhone,
      middleName: data.middleName || undefined,
      familyName: data.familyName || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      idType: data.idType,
      idNumber: data.idNumber || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      sex: (data.sex as 'male' | 'female') || undefined,
      nzokNumber: data.nzokNumber || undefined,
      rzokOblast: data.rzokOblast || undefined,
      healthRegion: data.healthRegion || undefined,
      unfavorableConditions: data.unfavorableConditions || undefined,
      exemptFromFee: data.exemptFromFee || undefined,
      pensioner: data.pensioner || undefined,
      familyGroupId: selectedFamilyGroupId || undefined
    });
    
    console.info(
      `[AUDIT] PATIENT_UPDATED | Name: ${fullName} | ID: ${editPatientId} | Time: ${new Date().toISOString()}`
    );
    
    showToast({
      message: t('patient.patientUpdated', 'Patient updated successfully'),
      type: 'success',
      duration: 4000
    });
    
    document.dispatchEvent(
      new CustomEvent('patient:editSaved', { detail: { patientId: editPatientId } })
    );
    return;
  }

  // ── Create mode: check for duplicates first ──
  const existing = patientRepository.exists(fullName, fullPhone);
  if (existing) {
    displayValidationErrors({
      duplicate: t('patient.duplicatePatient',
        'A patient with this name or phone already exists')
    });
    return;
  }

  // Create patient
  const newPatient = patientRepository.create({
    name: fullName,
    phone: fullPhone,
    appointmentTime: '',
    status: 'Confirmed',
    statusIcon: 'check',
    actions: [],
    middleName: data.middleName || undefined,
    familyName: data.familyName || undefined,
    email: data.email || undefined,
    address: data.address || undefined,
    idType: data.idType,
    idNumber: data.idNumber || undefined,
    dateOfBirth: data.dateOfBirth || undefined,
    sex: data.sex || undefined,
    nzokNumber: data.nzokNumber || undefined,
    rzokOblast: data.rzokOblast || undefined,
    healthRegion: data.healthRegion || undefined,
    unfavorableConditions: data.unfavorableConditions || undefined,
    exemptFromFee: data.exemptFromFee || undefined,
    pensioner: data.pensioner || undefined,
    familyGroupId: selectedFamilyGroupId || undefined,
    punctualityScore: 'punctual'
  });

  console.info(
    `[AUDIT] PATIENT_CREATED | Name: ${fullName} | ID: ${newPatient.id} | Time: ${new Date().toISOString()}`
  );

  showToast({
    message: t('patient.patientCreated', 'Patient created successfully'),
    type: 'success',
    duration: 5000
  });

  // Reset form
  const form = document.getElementById(FORM_IDS.form) as HTMLFormElement;
  form?.reset();
  setSelectedFamilyGroupId('');
};


