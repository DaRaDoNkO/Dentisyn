import { renderAppointmentModal, initAppointmentModal } from '../../appointment/AppointmentModal';
import { refreshCalendar } from './refresh';

/**
 * Show appointment modal for creating a new appointment
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

  // Initialize modal event handlers with callback to refresh calendar
  initAppointmentModal(() => {
    console.info(`[DEBUG] Appointment saved, refreshing calendar`);
    refreshCalendar();
  });
  
  // Apply i18n translations to modal content
  if ((window as any).i18next) {
    setTimeout(() => {
      const elements = modalContainer.querySelectorAll('[data-i18n]');
      elements.forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (key) {
          element.textContent = (window as any).i18next.t(key);
        }
      });
    }, 10);
  }

  // Show the modal using setTimeout to ensure DOM is updated
  setTimeout(() => {
    const appointmentModal = document.getElementById('appointmentModal');
    if (!appointmentModal) {
      console.error('[ERROR] appointmentModal element not found after rendering');
      alert('Failed to create modal. Please try again.');
      return;
    }
    
    console.info(`[DEBUG] Found appointmentModal element, attempting to show`);
    
    // Use the globally available Bootstrap from window
    const Bootstrap = (window as any).bootstrap;
    if (!Bootstrap || !Bootstrap.Modal) {
      console.error('[ERROR] Bootstrap.Modal not available', {
        windowBootstrap: (window as any).bootstrap,
        hasModal: (window as any).bootstrap?.Modal
      });
      alert('Bootstrap not loaded properly. Please refresh the page.');
      return;
    }
    
    try {
      const bsModal = new Bootstrap.Modal(appointmentModal, { backdrop: true, keyboard: true });
      console.info(`[DEBUG] Bootstrap modal created successfully, showing now`);
      bsModal.show();
    } catch (error) {
      console.error('[ERROR] Failed to initialize Bootstrap modal:', error);
      alert('Failed to show modal. Check console for details.');
    }
  }, 100);
};
