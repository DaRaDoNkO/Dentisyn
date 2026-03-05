/**
 * Patient selection helper functions for the appointment typeahead
 */

import { patientRepository } from '../../repositories/patientRepository';
import type { Patient } from '../../types/patient';

export function selectExistingPatient(
  patientId: string,
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  selectedPatientName: HTMLElement,
  selectedPatientDetails: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
): void {
  selectedPatientRef.current = patientRepository.getById(patientId);
  if (!selectedPatientRef.current) return;

  patientNameSearch.value = '';
  typeaheadDropdown.style.display = 'none';
  selectedPatientInfo.style.display = 'flex';
  newPatientForm.style.display = 'none';
  selectedPatientName.textContent = selectedPatientRef.current.name;
  selectedPatientDetails.textContent = `Phone: ${selectedPatientRef.current.phone}`;
  console.info('[DEBUG] Selected existing patient:', selectedPatientRef.current.id);
}

export function switchToEditMode(
  nameToSplit: string,
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
): void {
  patientNameSearch.value = '';
  typeaheadDropdown.style.display = 'none';
  selectedPatientInfo.style.display = 'none';
  newPatientForm.style.display = 'block';
  selectedPatientRef.current = null;

  const firstNameInput = document.getElementById('patientFirstName') as HTMLInputElement;
  const lastNameInput  = document.getElementById('patientLastName')  as HTMLInputElement;

  if (firstNameInput && lastNameInput && nameToSplit) {
    const parts = nameToSplit.trim().split(/\s+/);
    firstNameInput.value = parts[0] || '';
    lastNameInput.value  = parts.slice(1).join(' ') || '';
    console.info('[DEBUG] Auto-filled name from query:', { first: parts[0], last: parts.slice(1).join(' ') });
  }
}
