/**
 * Pending appointment banner rendering and handlers
 */

import {
  getPendingAppointment,
  clearPendingAppointment
} from '../../../../services/pendingAppointmentService';
import i18next from '../../../../i18n';

export const setupPendingBanner = (
  calendarEl: HTMLElement,
  onFilterUpdate: () => void
): void => {
  const pending = getPendingAppointment();
  if (!pending) return;

  // Show banner
  const bannerHtml = `
    <div id="pendingPatientBanner" class="alert alert-info d-flex justify-content-between align-items-center mb-2 rounded-3 shadow-sm">
      <div>
        <i class="bi bi-person-plus me-2"></i>
        <strong>${i18next.t('table.bookingFor', 'Booking for')}:</strong>
        ${pending.patientName}
        <span class="text-muted ms-2">${pending.phone}</span>
        <span class="badge bg-primary ms-2">${i18next.t('table.clickSlotToBook', 'Click a time slot to book')}</span>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger" id="cancelPendingBtn">
        <i class="bi bi-x-lg me-1"></i>${i18next.t('table.cancel', 'Cancel')}
      </button>
    </div>`;
  
  calendarEl.insertAdjacentHTML('beforebegin', bannerHtml);

  // Cancel pending handler
  document.getElementById('cancelPendingBtn')?.addEventListener('click', () => {
    clearPendingAppointment();
    document.getElementById('pendingPatientBanner')?.remove();
  });

  // Auto-filter to pending doctor
  const filterIvanov = document.getElementById('filterIvanov') as HTMLInputElement;
  const filterRuseva = document.getElementById('filterRuseva') as HTMLInputElement;

  if (pending.doctorId === 'dr-ivanov' && filterRuseva) {
    filterRuseva.checked = false;
    onFilterUpdate();
  } else if (pending.doctorId === 'dr-ruseva' && filterIvanov) {
    filterIvanov.checked = false;
    onFilterUpdate();
  }
};
