import type { EventApi } from '@fullcalendar/core';
import { showToast } from '../../../../utils/toast';
import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { formatTime } from '../../../../utils/dateUtils';
import { getThemeColors, getPopupCSS, getOverlayCSS, getLabelCSS, getTitleCSS, getHeaderCSS, getCloseButtonCSS, getFieldContainerCSS, getReasoneBoxCSS } from '../../../../utils/popupStyles';
import { refreshCalendar } from '../refresh';
import i18next from '../../../../i18n';
import { showEditAppointmentPopup } from './editPopup';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

/**
 * Show event details popup when clicking on an appointment
 */
export const showEventDetailsPopup = (event: EventApi) => {
  const { patientName, phone, reason, doctor } = event.extendedProps;
  const colors = getThemeColors();

  // Remove any existing popups
  const existingPopup = document.getElementById('event-details-popup');
  if (existingPopup) existingPopup.remove();
  const existingOverlay = document.getElementById('event-popup-overlay');
  if (existingOverlay) existingOverlay.remove();

  // Create popup
  const popup = document.createElement('div');
  popup.id = 'event-details-popup';
  popup.style.cssText = getPopupCSS(colors) + '; min-width: 380px; max-width: 500px;';

  const doctorName = doctor === 'dr-ivanov'
    ? t('calendar.drIvanov', 'Dr. Ivanov')
    : t('calendar.drRuseva', 'Dr. Ruseva');
  const startTime = event.start ? formatTime(event.start) : 'N/A';
  const endTime = event.end ? formatTime(event.end) : 'N/A';

  const labelStyle = `${getLabelCSS()} color: ${colors.labelColor};`;

  popup.innerHTML = `
    <div style="${getHeaderCSS()}">
      <h5 style="${getTitleCSS(colors)}">
        ${t('calendar.appointmentDetails', 'Appointment Details')}
      </h5>
      <button id="closeEventPopup" style="${getCloseButtonCSS(colors)}">&times;</button>
    </div>
    
    <div style="${getFieldContainerCSS()}">
      <div>
        <label style="${labelStyle}">
          ${t('calendar.patient', 'Patient')}
        </label>
        <div style="font-size: 16px; color: ${colors.textColor}; font-weight: 600;">${patientName || 'N/A'}</div>
      </div>
      
      <div>
        <label style="${labelStyle}">
          ${t('calendar.phone', 'Phone')}
        </label>
        <div style="font-size: 14px; color: ${colors.textColor};">
          <i class="bi bi-telephone" style="margin-right: 6px; color: ${colors.labelColor};"></i>${phone || 'N/A'}
        </div>
      </div>
      
      <div>
        <label style="${labelStyle}">
          ${t('calendar.doctor', 'Doctor')}
        </label>
        <div style="font-size: 14px; color: ${colors.textColor};">${doctorName}</div>
      </div>
      
      <div>
        <label style="${labelStyle}">
          ${t('calendar.time', 'Time')}
        </label>
        <div style="font-size: 14px; color: ${colors.textColor};">
          <i class="bi bi-clock" style="margin-right: 6px; color: ${colors.labelColor};"></i>${startTime} - ${endTime}
        </div>
      </div>
      
      ${reason && reason !== 'No reason specified' ? `
        <div>
          <label style="${labelStyle}">
            ${t('calendar.reasonNotes', 'Reason / Notes')}
          </label>
          <div style="${getReasoneBoxCSS(colors)}">${reason}</div>
        </div>
      ` : ''}
    </div>
    
    <div style="margin-top: 22px; display: flex; gap: 8px; justify-content: flex-end;">
      <button id="deleteEventBtn" class="btn btn-outline-danger btn-sm" style="display: flex; align-items: center; gap: 6px;">
        <i class="bi bi-trash"></i>
        ${t('calendar.deleteAppointment', 'Delete')}
      </button>
      <button id="editEventBtn" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;">
        <i class="bi bi-pencil"></i>
        ${t('calendar.editAppointment', 'Edit Appointment')}
      </button>
    </div>
  `;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'event-popup-overlay';
  overlay.style.cssText = getOverlayCSS();

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Close handlers
  const closePopup = () => {
    popup.remove();
    overlay.remove();
  };

  document.getElementById('closeEventPopup')?.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  // Delete handler
  document.getElementById('deleteEventBtn')?.addEventListener('click', () => {
    const confirmMsg = t('messages.toast.deleteConfirm', 'Are you sure you want to delete this appointment?');
    if (confirm(confirmMsg)) {
      appointmentRepository.delete(event.id);
      closePopup();
      refreshCalendar();
      showToast({
        type: 'success',
        message: t('messages.toast.appointmentDeleted', 'Appointment deleted successfully!'),
        duration: 3000
      });
    }
  });

  // Edit handler — open inline edit form
  document.getElementById('editEventBtn')?.addEventListener('click', () => {
    closePopup();
    showEditAppointmentPopup(event);
  });

  console.info(`[DEBUG] Showing event details for appointment: ${event.id}`);
};
