import i18next from '../../../i18n';
import { patientRepository } from '../../../repositories/patientRepository';
import { validateEGN, validateLNCh } from '../../../utils/bgUtils';
import { showToast } from '../../../utils/toast';
import { toInputDate } from '../../../utils/dateUtils';
import type { NewPatientFormData, FormValidationErrors, FamilySuggestion } from './types';
import type { PatientIdType } from '../../../types/patient';

const t = (key: string, fb: string) => i18next.t(key, fb);

/** Initialize the New Patient form. Pass editPatientId to switch to edit mode. */
export function initNewPatientForm(editPatientId?: string): void {
  if (editPatientId) {
    prefillFormWithPatient(editPatientId);
    setupEditModeUI(editPatientId);
  }
  setupEgnAutoFill();
  setupFormSubmission(editPatientId);
  setupFamilyDetection();
}

// ─── Edit Mode Helpers ───────────────────────────────

function prefillFormWithPatient(patientId: string): void {
  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  const set = (id: string, value: string) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = value;
  };
  const setCheck = (id: string, value: boolean) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.checked = value;
  };

  // Name fields — prefer stored per-field values, fall back to splitting combined name
  const parts = patient.name.split(' ');
  set('npFirstName', parts[0] ?? '');
  set('npMiddleName', patient.middleName ?? (parts.length === 3 ? parts[1] : ''));
  set('npFamilyName', patient.familyName ?? parts[parts.length - 1] ?? '');

  // Phone — split stored country code from number
  const phone = patient.phone ?? '';
  const codeMatch = phone.match(/^(\+\d{1,4})/);
  if (codeMatch) {
    const codeEl = document.getElementById('npCountryCode') as HTMLSelectElement | null;
    if (codeEl) codeEl.value = codeMatch[1];
    set('npPhone', phone.slice(codeMatch[1].length).trim());
  } else {
    set('npPhone', phone);
  }

  set('npEmail', patient.email ?? '');
  set('npAddress', patient.address ?? '');

  const idTypeEl = document.getElementById('npIdType') as HTMLSelectElement | null;
  if (idTypeEl && patient.idType) idTypeEl.value = patient.idType;
  set('npIdNumber', patient.idNumber ?? '');
  set('npDob', patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '');

  const sexEl = document.getElementById('npSex') as HTMLSelectElement | null;
  if (sexEl && patient.sex) sexEl.value = patient.sex;

  set('npNzokNumber', patient.nzokNumber ?? '');
  const rzokEl = document.getElementById('npRzokOblast') as HTMLSelectElement | null;
  if (rzokEl && patient.rzokOblast) rzokEl.value = patient.rzokOblast;
  const regionEl = document.getElementById('npHealthRegion') as HTMLSelectElement | null;
  if (regionEl && patient.healthRegion) regionEl.value = patient.healthRegion;

  setCheck('npUnfavorable', patient.unfavorableConditions ?? false);
  setCheck('npExemptFee', patient.exemptFromFee ?? false);
  setCheck('npPensioner', patient.pensioner ?? false);

  selectedFamilyGroupId = patient.familyGroupId ?? '';
}

function setupEditModeUI(patientId: string): void {
  // Change submit button to "Save Changes"
  const submitBtn = document.getElementById('createPatientBtn');
  if (submitBtn) {
    submitBtn.innerHTML =
      '<i class="bi bi-floppy me-1"></i>' +
      `<span data-i18n="patient.saveChanges">${t('patient.saveChanges', 'Save Changes')}</span>`;
  }

  // Change Cancel (reset) button to dispatch editCancelled instead of resetting
  const cancelBtn = document.querySelector('#newPatientForm button[type="reset"]') as HTMLButtonElement | null;
  if (cancelBtn) {
    cancelBtn.type = 'button';
    cancelBtn.addEventListener('click', () => {
      document.dispatchEvent(
        new CustomEvent('patient:editCancelled', { detail: { patientId } })
      );
    });
  }
}

// ─── EGN Auto-fill ───────────────────────────────────

function setupEgnAutoFill(): void {
  const idTypeSelect = document.getElementById('npIdType') as HTMLSelectElement | null;
  const idNumberInput = document.getElementById('npIdNumber') as HTMLInputElement | null;

  if (!idNumberInput) return;

  // On ID number change, validate and auto-fill for EGN
  idNumberInput.addEventListener('input', () => {
    const idType = idTypeSelect?.value as PatientIdType ?? 'EGN';
    const value = idNumberInput.value.trim();

    clearIdValidation();

    if (idType === 'EGN' && value.length === 10) {
      handleEgnAutoFill(value);
    } else if (idType === 'LNCh' && value.length === 10) {
      handleLnchValidation(value);
    }
  });

  // Re-validate when ID type changes
  idTypeSelect?.addEventListener('change', () => {
    const value = idNumberInput.value.trim();
    clearIdValidation();
    clearAutoFillIndicators();

    const idType = idTypeSelect.value as PatientIdType;
    if (idType === 'EGN' && value.length === 10) {
      handleEgnAutoFill(value);
    } else if (idType === 'LNCh' && value.length === 10) {
      handleLnchValidation(value);
    }
  });
}

function handleEgnAutoFill(egn: string): void {
  const result = validateEGN(egn);
  const idInput = document.getElementById('npIdNumber') as HTMLInputElement;

  if (!result.valid) {
    idInput.classList.add('is-invalid');
    const errEl = document.getElementById('npIdNumberError');
    if (errEl) errEl.textContent = t('patient.invalidEgn', 'Invalid EGN');
    return;
  }

  idInput.classList.remove('is-invalid');
  idInput.classList.add('is-valid');

  // Auto-fill DOB
  if (result.dob) {
    const dobInput = document.getElementById('npDob') as HTMLInputElement | null;
    if (dobInput) {
      dobInput.value = toInputDate(result.dob);
      document.getElementById('npDobAutoFill')?.classList.remove('d-none');
    }
  }

  // Auto-fill Sex
  if (result.sex) {
    const sexSelect = document.getElementById('npSex') as HTMLSelectElement | null;
    if (sexSelect) {
      sexSelect.value = result.sex === 'm' ? 'male' : 'female';
      document.getElementById('npSexAutoFill')?.classList.remove('d-none');
    }
  }
}

function handleLnchValidation(lnch: string): void {
  const result = validateLNCh(lnch);
  const idInput = document.getElementById('npIdNumber') as HTMLInputElement;

  if (!result.valid) {
    idInput.classList.add('is-invalid');
    const errEl = document.getElementById('npIdNumberError');
    if (errEl) errEl.textContent = t('patient.invalidLnch', 'Invalid LNCh');
  } else {
    idInput.classList.remove('is-invalid');
    idInput.classList.add('is-valid');
  }
}

function clearIdValidation(): void {
  const idInput = document.getElementById('npIdNumber') as HTMLInputElement | null;
  idInput?.classList.remove('is-invalid', 'is-valid');
}

function clearAutoFillIndicators(): void {
  document.getElementById('npDobAutoFill')?.classList.add('d-none');
  document.getElementById('npSexAutoFill')?.classList.add('d-none');
}

// ─── Family Detection ────────────────────────────────

function setupFamilyDetection(): void {
  const familyNameInput = document.getElementById('npFamilyName') as HTMLInputElement | null;
  const phoneInput = document.getElementById('npPhone') as HTMLInputElement | null;

  let debounceTimer: ReturnType<typeof setTimeout>;

  const check = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkFamilyLinks(
        familyNameInput?.value.trim() ?? '',
        phoneInput?.value.trim() ?? ''
      );
    }, 500);
  };

  familyNameInput?.addEventListener('input', check);
  phoneInput?.addEventListener('input', check);
}

function checkFamilyLinks(familyName: string, phone: string): void {
  const area = document.getElementById('familyLinkArea');
  if (!area) return;

  if (!familyName && !phone) {
    area.classList.add('d-none');
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
    area.classList.add('d-none');
    area.innerHTML = '';
    return;
  }

  area.classList.remove('d-none');
  area.innerHTML = renderFamilySuggestions(suggestions);
  setupFamilyLinkHandlers();
}

function renderFamilySuggestions(suggestions: FamilySuggestion[]): string {
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
}

let selectedFamilyGroupId = '';

function setupFamilyLinkHandlers(): void {
  document.querySelectorAll('.family-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const patientId = (btn as HTMLElement).dataset.patientId ?? '';
      const patient = patientRepository.getById(patientId);

      if (patient) {
        // Use existing group or create new
        selectedFamilyGroupId = patient.familyGroupId
          ?? `family-${Date.now()}`;

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

        // Mark button as linked
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success', 'disabled');
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Linked';
      }
    });
  });
}

// ─── Form Submission ─────────────────────────────────

function setupFormSubmission(editPatientId?: string): void {
  const form = document.getElementById('newPatientForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(editPatientId);
  });

  // Reset listener only needed in create mode (edit mode overrides cancel button)
  if (!editPatientId) {
    form.addEventListener('reset', () => {
      setTimeout(() => {
        form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
          el.classList.remove('is-invalid', 'is-valid');
        });
        clearAutoFillIndicators();
        document.getElementById('familyLinkArea')?.classList.add('d-none');
        document.getElementById('formValidationSummary')?.classList.add('d-none');
        selectedFamilyGroupId = '';
      }, 0);
    });
  }
}

function handleFormSubmit(editPatientId?: string): void {
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
  const form = document.getElementById('newPatientForm') as HTMLFormElement;
  form?.reset();
  selectedFamilyGroupId = '';
}

function collectFormData(): NewPatientFormData {
  const val = (id: string) =>
    (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? '';
  const checked = (id: string) =>
    (document.getElementById(id) as HTMLInputElement | null)?.checked ?? false;

  return {
    firstName: val('npFirstName'),
    middleName: val('npMiddleName'),
    familyName: val('npFamilyName'),
    phone: val('npPhone'),
    countryCode: val('npCountryCode'),
    email: val('npEmail'),
    address: val('npAddress'),
    idType: (val('npIdType') || 'EGN') as PatientIdType,
    idNumber: val('npIdNumber'),
    dateOfBirth: val('npDob'),
    sex: val('npSex') as 'male' | 'female' | '',
    nzokNumber: val('npNzokNumber'),
    rzokOblast: val('npRzokOblast'),
    healthRegion: val('npHealthRegion'),
    unfavorableConditions: checked('npUnfavorable'),
    exemptFromFee: checked('npExemptFee'),
    pensioner: checked('npPensioner'),
    familyGroupId: selectedFamilyGroupId
  };
}

function validateFormData(data: NewPatientFormData): FormValidationErrors {
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
}

function displayValidationErrors(errors: FormValidationErrors): void {
  // Show summary
  const summary = document.getElementById('formValidationSummary');
  if (summary) {
    if (errors.duplicate) {
      summary.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${errors.duplicate}`;
    }
    summary.classList.remove('d-none');
  }

  // Mark fields
  const fieldMap: Record<string, string> = {
    firstName: 'npFirstName',
    familyName: 'npFamilyName',
    phone: 'npPhone',
    email: 'npEmail',
    idNumber: 'npIdNumber'
  };

  for (const [field, inputId] of Object.entries(fieldMap)) {
    const input = document.getElementById(inputId);
    if (errors[field as keyof FormValidationErrors]) {
      input?.classList.add('is-invalid');
    } else {
      input?.classList.remove('is-invalid');
    }
  }
}
