import type { EventApi } from '@fullcalendar/core';
import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { formatTime } from '../../../../utils/dateUtils';
import { getThemeColors, getPopupCSS, getOverlayCSS, getLabelCSS, getTitleCSS, getHeaderCSS, getCloseButtonCSS, getFieldContainerCSS, getReasoneBoxCSS } from '../../../../utils/popupStyles';
import i18next from '../../../../i18n';
import { wireEventDetailsActions } from './eventDetailsActions';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

export const showEventDetailsPopup = (event: EventApi) => {
  const { patientName, phone, reason, doctor } = event.extendedProps;
  const colors = getThemeColors();

  document.getElementById('event-details-popup')?.remove();
  document.getElementById('event-popup-overlay')?.remove();

  const popup = document.createElement('div');
  popup.id = 'event-details-popup';
  popup.style.cssText = getPopupCSS(colors) + '; min-width: 380px; max-width: 500px;';

  const doctorName = doctor === 'dr-ivanov'
    ? t('calendar.drIvanov', 'Dr. Ivanov')
    : t('calendar.drRuseva', 'Dr. Ruseva');
  const startTime = event.start ? formatTime(event.start) : 'N/A';
  const endTime = event.end ? formatTime(event.end) : 'N/A';
  const labelStyle = `${getLabelCSS()} color: ${colors.labelColor};`;

  const appointment = appointmentRepository.getById(event.id);
  const isPending = appointment?.status === 'Pending';

  popup.innerHTML = `
    <div style="${getHeaderCSS()} align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <h5 style="${getTitleCSS(colors)}">${t('calendar.appointmentDetails', 'Appointment Details')}</h5>
        <button id="editEventBtn" style="width:32px;height:32px;border-radius:8px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:transform 0.15s;box-shadow:0 2px 8px rgba(99,102,241,0.3);flex-shrink:0;"><i class="bi bi-pencil"></i></button>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="deleteEventBtn" style="width:32px;height:32px;border-radius:8px;border:none;background:rgba(220,53,69,0.1);color:#dc3545;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;transition:all 0.15s;"><i class="bi bi-trash3"></i></button>
        <button id="closeEventPopup" style="${getCloseButtonCSS(colors)}">&times;</button>
      </div>
    </div>
    <div style="${getFieldContainerCSS()}">
      <div><label style="${labelStyle}">${t('calendar.patient', 'Patient')}</label>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <a href="#" id="openPatientCartonLink" style="font-size:16px;color:var(--bs-primary);font-weight:600;text-decoration:none;cursor:pointer;">${patientName || 'N/A'}</a>
          <button id="patientHistoryBtn" title="${t('calendar.appointmentHistory', 'Appointment history')}" style="border:none;background:transparent;cursor:pointer;color:var(--bs-primary);font-size:18px;display:flex;align-items:center;padding:0;"><i class="bi bi-clock-history"></i></button>
        </div>
      </div>
      <div><label style="${labelStyle}">${t('calendar.phone', 'Phone')}</label>
        <div style="font-size:14px;color:${colors.textColor};"><i class="bi bi-telephone" style="margin-right:6px;color:${colors.labelColor};"></i>${phone || 'N/A'}</div></div>
      <div><label style="${labelStyle}">${t('calendar.doctor', 'Doctor')}</label>
        <div style="font-size:14px;color:${colors.textColor};">${doctorName}</div></div>
      <div><label style="${labelStyle}">${t('calendar.time', 'Time')}</label>
        <div style="font-size:14px;color:${colors.textColor};"><i class="bi bi-clock" style="margin-right:6px;color:${colors.labelColor};"></i>${startTime} - ${endTime}</div></div>
      ${reason && reason !== 'No reason specified' ? `<div><label style="${labelStyle}">${t('calendar.reasonNotes', 'Reason / Notes')}</label><div style="${getReasoneBoxCSS(colors)}">${reason}</div></div>` : ''}
    </div>
    <div style="margin-top:22px;display:flex;gap:8px;justify-content:flex-end;">
      <button id="rejectEventBtn" class="btn btn-outline-danger btn-sm" style="display:flex;align-items:center;gap:6px;"><i class="bi bi-x-circle"></i>${t('calendar.rejectAppointment', 'Reject')}</button>
      <button id="duplicateEventBtn" class="btn btn-outline-primary btn-sm" style="display:flex;align-items:center;gap:6px;"><i class="bi bi-clipboard-plus"></i>${t('calendar.duplicateBtn', 'Duplicate')}</button>
      ${isPending ? `<button id="confirmEventBtn" class="btn btn-success btn-sm" style="display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;"><i class="bi bi-check-circle"></i>${t('calendar.confirmAppointment', 'Confirm')}</button>` : ''}
    </div>
  `;

  const overlay = document.createElement('div');
  overlay.id = 'event-popup-overlay';
  overlay.style.cssText = getOverlayCSS();

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  const closePopup = () => { popup.remove(); overlay.remove(); };
  wireEventDetailsActions(event, overlay, closePopup);

  console.info(`[DEBUG] Showing event details for appointment: ${event.id}`);
};
