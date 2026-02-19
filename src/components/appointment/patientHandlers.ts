/**
 * Patient-related handlers for appointment modal
 * Handles typeahead search, patient selection, and ID validation
 */

import { patientRepository } from '../../repositories/patientRepository';
import type { Patient } from '../../types/patient';
import { validateEGN, validateLNCh, detectIDType } from '../../utils/bgUtils';

/**
 * Setup patient typeahead search functionality
 * @param patientNameSearch - Input element for patient search
 * @param typeaheadDropdown - Dropdown element for search results
 * @param selectedPatientInfo - Element to display selected patient info
 * @param selectedPatientName - Element to display patient name
 * @param selectedPatientDetails - Element to display patient details
 * @param newPatientForm - Form element for new patient
 * @param selectedPatientRef - Reference object to store selected patient
 */
export function setupPatientTypeahead(
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  selectedPatientName: HTMLElement,
  selectedPatientDetails: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
) {
  const handleTypeahead = (e: Event) => {
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 2) {
      typeaheadDropdown.style.display = 'none';
      return;
    }

    const results = patientRepository.search(query);

    let dropdownHTML = '';

    // Show existing patients
    if (results.length > 0) {
      dropdownHTML += results
        .map(
          (patient) => `
        <button 
          type="button" 
          class="dropdown-item patient-result-item" 
          data-patient-id="${patient.id}"
        >
          <strong>${patient.name}</strong><br>
          <small class="text-muted">${patient.phone}</small>
        </button>
      `
        )
        .join('');
    }

    // Always show "Create new" option
    dropdownHTML += `
      <button 
        type="button" 
        class="dropdown-item text-primary border-top create-new-patient-item"
        data-create-name="${query}"
      >
        <i class="bi bi-plus-circle me-2"></i>
        <strong>➕ Create new: "${query}"</strong>
      </button>
    `;

    typeaheadDropdown.innerHTML = dropdownHTML;
    typeaheadDropdown.style.display = 'block';

    // Attach click handlers
    const patientResults = typeaheadDropdown.querySelectorAll('.patient-result-item');
    patientResults.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const button = e.currentTarget as HTMLElement;
        const patientId = button.dataset.patientId;
        selectExistingPatient(
          patientId!,
          patientNameSearch,
          typeaheadDropdown,
          selectedPatientInfo,
          selectedPatientName,
          selectedPatientDetails,
          newPatientForm,
          selectedPatientRef
        );
      });
    });

    const createNewBtn = typeaheadDropdown.querySelector('.create-new-patient-item');
    if (createNewBtn) {
      createNewBtn.addEventListener('click', (e) => {
        const button = e.currentTarget as HTMLElement;
        const nameToCreate = button.dataset.createName || '';
        switchToEditMode(
          nameToCreate,
          patientNameSearch,
          typeaheadDropdown,
          selectedPatientInfo,
          newPatientForm,
          selectedPatientRef
        );
      });
    }
  };

  patientNameSearch.addEventListener('input', handleTypeahead);

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!patientNameSearch.contains(e.target as Node) && !typeaheadDropdown.contains(e.target as Node)) {
      typeaheadDropdown.style.display = 'none';
    }
  });
}

/**
 * Select an existing patient
 */
function selectExistingPatient(
  patientId: string,
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  selectedPatientName: HTMLElement,
  selectedPatientDetails: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
) {
  selectedPatientRef.current = patientRepository.getById(patientId);

  if (selectedPatientRef.current) {
    patientNameSearch.value = '';
    typeaheadDropdown.style.display = 'none';
    selectedPatientInfo.style.display = 'flex';
    newPatientForm.style.display = 'none';

    selectedPatientName.textContent = selectedPatientRef.current.name;
    selectedPatientDetails.textContent = `Phone: ${selectedPatientRef.current.phone}`;

    console.info('[DEBUG] Selected existing patient:', selectedPatientRef.current.id);
  }
}

/**
 * Switch to edit mode (create new patient)
 */
function switchToEditMode(
  nameToSplit: string,
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
) {
  patientNameSearch.value = '';
  typeaheadDropdown.style.display = 'none';
  selectedPatientInfo.style.display = 'none';
  newPatientForm.style.display = 'block';
  selectedPatientRef.current = null;

  // Split name by space and auto-fill First/Last Name
  const firstNameInput = document.getElementById('patientFirstName') as HTMLInputElement;
  const lastNameInput = document.getElementById('patientLastName') as HTMLInputElement;

  if (firstNameInput && lastNameInput && nameToSplit) {
    const parts = nameToSplit.trim().split(/\s+/);
    firstNameInput.value = parts[0] || '';
    lastNameInput.value = parts.slice(1).join(' ') || '';
    console.info('[DEBUG] Auto-filled name from query:', { first: parts[0], last: parts.slice(1).join(' ') });
  }
}

/**
 * Setup change patient button
 */
export function setupChangePatientButton(
  changePatientBtn: HTMLButtonElement,
  selectedPatientInfo: HTMLElement,
  patientNameSearch: HTMLInputElement,
  selectedPatientRef: { current: Patient | null }
) {
  changePatientBtn.addEventListener('click', () => {
    selectedPatientInfo.style.display = 'none';
    selectedPatientRef.current = null;
    patientNameSearch.value = '';
    patientNameSearch.focus();
    console.info('[DEBUG] User clicked Change Patient');
  });
}

/**
 * Setup phone number validation
 */
export function setupPhoneValidation() {
  const phoneNumberInput = document.getElementById('patientPhoneNumber') as HTMLInputElement;

  if (phoneNumberInput) {
    phoneNumberInput.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      // Replace non-digits with empty string
      input.value = input.value.replace(/\D/g, '');
    });
  }
}

/**
 * Setup ID auto-detection and validation
 */
export function setupIDAutoDetection() {
  const patientIDNumber = document.getElementById('patientIDNumber') as HTMLInputElement;
  const patientIDType = document.getElementById('patientIDType') as HTMLSelectElement;
  const patientDOB = document.getElementById('patientDOB') as HTMLInputElement;
  const patientSex = document.getElementById('patientSex') as HTMLSelectElement;
  const idValidationFeedback = document.getElementById('idValidationFeedback') as HTMLElement;

  if (!patientIDNumber || !patientIDType || !patientDOB || !patientSex || !idValidationFeedback) {
    return;
  }

  const handleIDAutoDetect = () => {
    const idValue = patientIDNumber.value.trim();

    if (!idValue) {
      idValidationFeedback.textContent = '';
      idValidationFeedback.className = 'text-muted';
      return;
    }

    const previousType = patientIDType.value;
    const detectedType = detectIDType(idValue);

    console.info('[DEBUG] ID Auto-Detect:', { idValue, previousType, detectedType });

    // Case A: Valid EGN
    if (detectedType === 'egn') {
      const egnResult = validateEGN(idValue);

      if (egnResult.valid && egnResult.dob && egnResult.sex) {
        patientIDType.value = 'egn';

        const year = egnResult.dob.getFullYear();
        const month = String(egnResult.dob.getMonth() + 1).padStart(2, '0');
        const day = String(egnResult.dob.getDate()).padStart(2, '0');
        patientDOB.value = `${year}-${month}-${day}`;

        patientSex.value = egnResult.sex;

        idValidationFeedback.textContent = '✓ Valid EGN - DOB and sex auto-filled';
        idValidationFeedback.className = 'text-success';

        console.info('[DEBUG] EGN validated and auto-filled');
      }
    }
    // Case B: Valid LNCh
    else if (detectedType === 'lnch') {
      const lnchResult = validateLNCh(idValue);

      if (lnchResult.valid) {
        if (previousType === 'lnch') {
          idValidationFeedback.textContent = '✓ Valid LNCh number';
          idValidationFeedback.className = 'text-success';
        } else {
          const shouldSwitch = confirm('Detected LNCh format (Resident ID).\n\nSwitch patient type to LNCh?');

          if (shouldSwitch) {
            patientIDType.value = 'lnch';
            idValidationFeedback.textContent = '✓ Valid LNCh - Switched to LNCh type';
            idValidationFeedback.className = 'text-success';
          } else {
            idValidationFeedback.textContent = '⚠ Valid LNCh but kept current type';
            idValidationFeedback.className = 'text-warning';
          }

          patientDOB.value = '';
          patientSex.value = '';
        }
      }
    }
    // Case C: Foreign/Invalid
    else if (detectedType === 'foreign') {
      if (previousType === 'foreign') {
        idValidationFeedback.textContent = 'Foreign ID / Passport';
        idValidationFeedback.className = 'text-muted';
      } else {
        const shouldSwitch = confirm('ID does not match EGN/LNCh format.\n\nMark patient as Foreign?');

        if (shouldSwitch) {
          patientIDType.value = 'foreign';
          idValidationFeedback.textContent = 'Marked as Foreign ID';
          idValidationFeedback.className = 'text-info';
        } else {
          idValidationFeedback.textContent = '⚠ Invalid EGN/LNCh format';
          idValidationFeedback.className = 'text-warning';
        }

        patientDOB.value = '';
        patientSex.value = '';
      }
    }
    else {
      idValidationFeedback.textContent = '✗ Invalid ID format';
      idValidationFeedback.className = 'text-danger';
      patientDOB.value = '';
      patientSex.value = '';
    }
  };

  patientIDNumber.addEventListener('blur', handleIDAutoDetect);
}
