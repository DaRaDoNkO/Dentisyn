import { renderAppointmentModal, initAppointmentModal } from '../../appointment/AppointmentModal';
import { refreshCalendar } from './refresh';
import {
  getPendingAppointment,
  clearPendingAppointment
} from '../../../services/pendingAppointmentService';

/**
 * Show appointment modal for creating a new appointment.
 * If a pending patient context exists (from "New Appointment" in queue),
 * auto-fill the patient information.
 */
export const showAppointmentModal = (clickedDateISO: string) => {
  console.info(`[DEBUG] showAppointmentModal called with: ${clickedDateISO}`);
  
  // Create or find modal container at body level for proper z-index stacking
  let modalContainer = document.getElementById('appointmentModalContainer');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'appointmentModalContainer';
    document.body.appendChild(modalContainer);
    console.info(`[DEBUG] Created new modal container at body level`);
  }

  console.info(`[DEBUG] Modal container found/created, clearing previous content`);
  
  // Clear previous modal content to avoid duplicates
  modalContainer.innerHTML = '';
  
  // Render modal HTML
  modalContainer.innerHTML = renderAppointmentModal(clickedDateISO);

  // Check for pending patient context
  const pending = getPendingAppointment();

  // Initialize modal event handlers with callback to refresh calendar
  initAppointmentModal(() => {
    console.info(`[DEBUG] Appointment saved, refreshing calendar`);
    refreshCalendar();
    // Clear pending context after successful save
    clearPendingAppointment();
  });
  
  // Apply i18n translations to modal content
  if ((window as unknown as Record<string, unknown>).i18next) {
    setTimeout(() => {
      const elements = modalContainer!.querySelectorAll('[data-i18n]');
      elements.forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (key) {
          element.textContent = ((window as unknown as Record<string, unknown>).i18next as { t: (k: string) => string }).t(key);
        }
      });
    }, 10);
  }

  // Show the modal using setTimeout to ensure DOM is updated
  setTimeout(() => {
    const appointmentModal = document.getElementById('appointmentModal');
    if (!appointmentModal) {
      console.error('[ERROR] appointmentModal element not found after rendering');
      return;
    }
    
    console.info(`[DEBUG] Found appointmentModal element, attempting to show`);
    
    // Use the globally available Bootstrap from window
    const Bootstrap = (window as unknown as Record<string, unknown>).bootstrap as {
      Modal: new (el: HTMLElement, opts?: Record<string, unknown>) => { show: () => void };
    } | undefined;
    if (!Bootstrap || !Bootstrap.Modal) {
      console.error('[ERROR] Bootstrap.Modal not available');
      return;
    }
    
    try {
      const bsModal = new Bootstrap.Modal(appointmentModal, { backdrop: true, keyboard: true });
      console.info(`[DEBUG] Bootstrap modal created successfully, showing now`);
      bsModal.show();

      // Pre-fill patient if pending context exists
      if (pending) {
        prefillPatientInModal(pending);
      }
    } catch (error) {
      console.error('[ERROR] Failed to initialize Bootstrap modal:', error);
    }
  }, 100);
};

/**
 * Pre-fill the appointment modal with patient data from the pending context
 */
function prefillPatientInModal(pending: {
  patientId: string;
  patientName: string;
  phone: string;
  doctorId: string;
}): void {
  // Fill the search input with the patient name and trigger selection
  const searchInput = document.getElementById('patientNameSearch') as HTMLInputElement;
  const selectedPatientInfo = document.getElementById('selectedPatientInfo') as HTMLElement;
  const selectedPatientName = document.getElementById('selectedPatientName') as HTMLElement;
  const selectedPatientDetails = document.getElementById('selectedPatientDetails') as HTMLElement;
  const newPatientForm = document.getElementById('newPatientForm') as HTMLElement;

  if (searchInput && selectedPatientInfo && selectedPatientName && selectedPatientDetails) {
    // Show patient info directly (skip search)
    searchInput.value = '';
    searchInput.style.display = 'none';
    const hint = searchInput.nextElementSibling;
    if (hint) (hint as HTMLElement).style.display = 'none';
    
    selectedPatientInfo.style.display = 'flex';
    selectedPatientName.textContent = pending.patientName;
    selectedPatientDetails.textContent = `Phone: ${pending.phone}`;
    if (newPatientForm) newPatientForm.style.display = 'none';

    console.info(`[DEBUG] Pre-filled patient: ${pending.patientName}`);
  }

  // Pre-select the doctor if available
  setTimeout(() => {
    const doctorSelect = document.getElementById('doctorSelect') as HTMLSelectElement;
    if (doctorSelect) {
      // Check if the doctor option exists
      const option = doctorSelect.querySelector(`option[value="${pending.doctorId}"]`);
      if (option) {
        doctorSelect.value = pending.doctorId;
      }
    }
  }, 200);
}
