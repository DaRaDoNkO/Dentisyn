import type { EventApi } from '@fullcalendar/core';
import { showToast } from '../../../../utils/toast';
import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { formatTime } from '../../../../utils/dateUtils';
import { getThemeColors, getPopupCSS, getOverlayCSS, getLabelCSS, getTitleCSS, getHeaderCSS, getCloseButtonCSS, getFieldContainerCSS, getReasoneBoxCSS } from '../../../../utils/popupStyles';
import { refreshCalendar } from '../refresh';
import i18next from '../../../../i18n';
import { showEditAppointmentPopup } from './editPopup';
import { startDuplicate } from '../duplicateService';
import { showDeleteConfirmModal } from './deleteConfirmModal';
import { showRejectModal } from './rejectModal';

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

  // Check appointment status for conditional buttons
  const appointment = appointmentRepository.getById(event.id);
  const isPending = appointment?.status === 'Pending';

  popup.innerHTML = `
    <div style="${getHeaderCSS()} align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <h5 style="${getTitleCSS(colors)}">
          ${t('calendar.appointmentDetails', 'Appointment Details')}
        </h5>
        <button id="editEventBtn" style="
          width: 32px; height: 32px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 14px; transition: transform 0.15s;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3); flex-shrink: 0;
        "><i class="bi bi-pencil"></i></button>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="deleteEventBtn" style="
          width: 32px; height: 32px; border-radius: 8px; border: none;
          background: rgba(220,53,69,0.1); color: #dc3545;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; transition: all 0.15s;
        "><i class="bi bi-trash3"></i></button>
        <button id="closeEventPopup" style="${getCloseButtonCSS(colors)}">&times;</button>
      </div>
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
      <button id="rejectEventBtn" class="btn btn-outline-danger btn-sm" style="display: flex; align-items: center; gap: 6px;">
        <i class="bi bi-x-circle"></i>
        ${t('calendar.rejectAppointment', 'Reject')}
      </button>
      <button id="duplicateEventBtn" class="btn btn-outline-primary btn-sm" style="display: flex; align-items: center; gap: 6px;">
        <i class="bi bi-clipboard-plus"></i>
        ${t('calendar.duplicateBtn', 'Duplicate')}
      </button>
      ${isPending ? `
        <button id="confirmEventBtn" class="btn btn-success btn-sm" style="display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #22c55e, #16a34a); border: none;">
          <i class="bi bi-check-circle"></i>
          ${t('calendar.confirmAppointment', 'Confirm')}
        </button>
      ` : ''}
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

  // Delete handler — styled confirmation modal
  document.getElementById('deleteEventBtn')?.addEventListener('click', () => {
    showDeleteConfirmModal(
      patientName || 'N/A',
      () => {
        appointmentRepository.delete(event.id);
        closePopup();
        refreshCalendar();
        showToast({
          type: 'success',
          message: t('messages.toast.appointmentDeleted', 'Appointment deleted successfully!'),
          duration: 3000
        });
      }
    );
  });

  // Edit handler — open inline edit form
  document.getElementById('editEventBtn')?.addEventListener('click', () => {
    closePopup();
    showEditAppointmentPopup(event);
  });

  // Reject handler — show reason selection modal
  document.getElementById('rejectEventBtn')?.addEventListener('click', () => {
    showRejectModal(
      patientName || 'N/A',
      (reason: string) => {
        appointmentRepository.update(event.id, {
          status: 'Rejected',
          rejectionReason: reason,
        });
        closePopup();
        refreshCalendar();
        showToast({
          type: 'warning',
          message: t('calendar.appointmentRejected', 'Appointment rejected'),
          duration: 3000
        });
        console.info(
          `[AUDIT] APPOINTMENT_REJECTED | ID: ${event.id} | Reason: ${reason} | Time: ${new Date().toISOString()}`
        );
      }
    );
  });

  // Confirm handler — mark appointment as Confirmed
  document.getElementById('confirmEventBtn')?.addEventListener('click', () => {
    appointmentRepository.update(event.id, {
      status: 'Confirmed',
      confirmedAt: new Date().toISOString(),
    });
    closePopup();
    refreshCalendar();
    showToast({
      type: 'success',
      message: t('calendar.appointmentConfirmed', 'Appointment confirmed!'),
      duration: 3000
    });
    console.info(
      `[AUDIT] APPOINTMENT_CONFIRMED | ID: ${event.id} | Time: ${new Date().toISOString()}`
    );
  });

  // Duplicate handler — copy appointment to clipboard
  document.getElementById('duplicateEventBtn')?.addEventListener('click', () => {
    const durationMs = (event.end && event.start)
      ? event.end.getTime() - event.start.getTime()
      : 30 * 60 * 1000; // default 30 min

    startDuplicate({
      patientId: event.extendedProps.patientId || '',
      patientName: patientName || '',
      phone: phone || '',
      doctor: doctor || 'dr-ivanov',
      reason: reason || '',
      durationMs,
    });

    closePopup();
  });

  console.info(`[DEBUG] Showing event details for appointment: ${event.id}`);
};
