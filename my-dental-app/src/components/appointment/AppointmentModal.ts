/**
 * Main Appointment Modal - Refactored for better maintainability
 * This file now orchestrates the different modules
 */

import type { Patient } from '../../types/patient';
import { renderAppointmentModal } from './renderAppointmentModal';
import {
  setupPatientTypeahead,
  setupChangePatientButton,
  setupPhoneValidation,
  setupIDAutoDetection
} from './patientHandlers';
import {
  setupDoctorAvailability,
  setupSaveAppointment
} from './appointmentFormHandlers';

// Module-level state for selected patient
let selectedPatient: Patient | null = null;

/**
 * Initialize appointment modal event handlers with smart features
 */
export const initAppointmentModal = (onSaveCallback?: () => void) => {
  const modal = document.getElementById('appointmentModal') as HTMLElement | null;
  if (!modal) {
    console.error('[ERROR] appointmentModal element not found');
    return;
  }

  // Get all required DOM elements
  const patientNameSearch = document.getElementById('patientNameSearch') as HTMLInputElement;
  const typeaheadDropdown = document.getElementById('patientTypeaheadDropdown') as HTMLElement;
  const selectedPatientInfo = document.getElementById('selectedPatientInfo') as HTMLElement;
  const selectedPatientName = document.getElementById('selectedPatientName') as HTMLElement;
  const selectedPatientDetails = document.getElementById('selectedPatientDetails') as HTMLElement;
  const changePatientBtn = document.getElementById('changePatientBtn') as HTMLButtonElement;
  const newPatientForm = document.getElementById('newPatientForm') as HTMLElement;
  const saveAppointmentBtn = document.getElementById('saveAppointmentBtn') as HTMLButtonElement;

  // Get time and doctor selection elements
  const startTimeSelect = document.getElementById('appointmentStartTime') as HTMLSelectElement;
  const endTimeSelect = document.getElementById('appointmentEndTime') as HTMLSelectElement;
  const doctorSelect = document.getElementById('doctorSelect') as HTMLSelectElement;
  const doctorHint = document.getElementById('doctorAvailabilityHint') as HTMLElement;

  console.info('[DEBUG] AppointmentModal initialized with smart features');

  // Create a reference object to share state between modules
  const selectedPatientRef = { current: selectedPatient };

  // Setup all handlers
  if (patientNameSearch && typeaheadDropdown && selectedPatientInfo && selectedPatientName && selectedPatientDetails && newPatientForm) {
    setupPatientTypeahead(
      patientNameSearch,
      typeaheadDropdown,
      selectedPatientInfo,
      selectedPatientName,
      selectedPatientDetails,
      newPatientForm,
      selectedPatientRef
    );
  }

  if (changePatientBtn && selectedPatientInfo && patientNameSearch) {
    setupChangePatientButton(changePatientBtn, selectedPatientInfo, patientNameSearch, selectedPatientRef);
  }

  setupPhoneValidation();
  setupIDAutoDetection();

  if (startTimeSelect && endTimeSelect && doctorSelect && doctorHint) {
    setupDoctorAvailability(startTimeSelect, endTimeSelect, doctorSelect, doctorHint);
  }

  if (saveAppointmentBtn && modal && newPatientForm && selectedPatientInfo && typeaheadDropdown) {
    setupSaveAppointment(
      saveAppointmentBtn,
      modal,
      selectedPatientRef,
      newPatientForm,
      selectedPatientInfo,
      typeaheadDropdown,
      onSaveCallback
    );
  }

  // --- CLEANUP ON MODAL HIDE ---
  modal.addEventListener('hidden.bs.modal', () => {
    console.info('[DEBUG] Modal hidden - cleanup');

    const modalContainer = document.getElementById('appointmentModalContainer');
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Reset selected patient state
    selectedPatient = null;
  }, { once: true });
};

// Re-export the render function
export { renderAppointmentModal };
