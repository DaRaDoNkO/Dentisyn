/**
 * Patient-related handlers for appointment modal
 * Handles typeahead search and patient selection.
 * ID auto-detection: see idAutoDetection.ts
 * ID detection dialog: see idDetectionDialog.ts
 */

import { patientRepository } from '../../repositories/patientRepository';
import type { Patient } from '../../types/patient';
import { selectExistingPatient, switchToEditMode } from './patientSelectionHelpers';

export { setupIDAutoDetection } from './idAutoDetection';

/** Setup patient typeahead search functionality */
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

