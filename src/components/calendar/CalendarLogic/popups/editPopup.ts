import type { EventApi } from '@fullcalendar/core';
import type { Doctor } from '../../../../types/patient';
import { showToast } from '../../../../utils/toast';
import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { getThemeColors, getPopupCSS, getOverlayCSS, getLabelCSS, getTitleCSS, getHeaderCSS, getCloseButtonCSS, getFieldContainerCSS, getInputCSS } from '../../../../utils/popupStyles';
import { refreshCalendar } from '../refresh';
import { loadCalendarSettings } from '../../../user/Settings/CalendarSettings/storage';
import { generateTimeOptions } from '../../../appointment/timeUtils';
import i18next from '../../../../i18n';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

/** Show inline edit form for an existing appointment */
export const showEditAppointmentPopup = (event: EventApi) => {
  const appointment = appointmentRepository.getById(event.id);
  if (!appointment) return;

  const colors = getThemeColors();
  const inputStyle = getInputCSS(colors);
  const labelStyle = `${getLabelCSS()} color: ${colors.labelColor};`;

  const popup = document.createElement('div');
  popup.id = 'event-details-popup';
  popup.style.cssText = getPopupCSS(colors) + '; min-width: 400px; max-width: 520px;';

  const settings = loadCalendarSettings();
  const is24h = settings.timeFormat === '24h';
  const timeOptionsHtml = generateTimeOptions(8, 20, 15, is24h);
  
  const selectOpts = (selected: string) =>
    timeOptionsHtml.split('\n').map(opt => {
      const match = opt.match(/value="([^"]+)"/);
      const value = match ? match[1] : '';
      return opt.replace('<option', `<option${value === selected ? ' selected' : ''}`);
    }).join('\n');

  const startDate = appointment.startTime.split('T')[0];
  const startTimeVal = appointment.startTime.includes('T')
    ? appointment.startTime.split('T')[1].substring(0, 5)
    : '09:00';
  const endTimeVal = appointment.endTime.includes('T')
    ? appointment.endTime.split('T')[1].substring(0, 5)
    : '09:30';

  const doctorOptions = ['dr-ivanov', 'dr-ruseva'].map(d => {
    const name = d === 'dr-ivanov'
      ? t('calendar.drIvanov', 'Dr. Ivanov')
      : t('calendar.drRuseva', 'Dr. Ruseva');
    const sel = appointment.doctor === d ? 'selected' : '';
    return `<option value="${d}" ${sel}>${name}</option>`;
  }).join('');

  popup.innerHTML = `
    <div style="${getHeaderCSS()}">
      <h5 style="${getTitleCSS(colors)}">
        <i class="bi bi-pencil-square" style="margin-right: 8px; color: #6366f1;"></i>
        ${t('calendar.editAppointment', 'Edit Appointment')}
      </h5>
      <button id="closeEditPopup" style="${getCloseButtonCSS(colors)}">&times;</button>
    </div>

    <div style="${getFieldContainerCSS()}">
      <div>
        <label style="${labelStyle}">
          ${t('calendar.patient', 'Patient')}
        </label>
        <div style="font-size: 15px; color: ${colors.textColor}; font-weight: 600; padding: 8px 0;">${appointment.patientName}</div>
      </div>

      <div>
        <label style="${labelStyle}">
          ${t('calendar.doctor', 'Doctor')}
        </label>
        <select id="editDoctor" style="${inputStyle}">${doctorOptions}</select>
      </div>

      <div>
        <label style="${labelStyle}">
          ${t('appointment.date', 'Date')}
        </label>
        <input type="date" id="editDate" value="${startDate}" style="${inputStyle}">
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="${labelStyle}">
            <span>${t('appointment.startTime', 'Start Time')}</span><span style="color:#dc3545;margin-left:4px;">*</span>
          </label>
          <select id="editStartTime" style="${inputStyle}">${selectOpts(startTimeVal)}</select>
        </div>
        <div style="flex: 1;">
          <label style="${labelStyle}">
            <span>${t('appointment.endTime', 'End Time')}</span><span style="color:#dc3545;margin-left:4px;">*</span>
          </label>
          <select id="editEndTime" style="${inputStyle}">${selectOpts(endTimeVal)}</select>
        </div>
      </div>

      ${settings.isReasonVisible ? `
      <div>
        <label style="${labelStyle}">
          <span>${t('appointment.reasonNotes', 'Reason')}</span>
          ${settings.isReasonRequired ? '<span style="color:#dc3545;margin-left:4px;">*</span>' : `<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#6c757d;color:#fff;margin-left:8px;">${t('appointment.optional', 'Optional')}</span>`}
        </label>
        <input type="text" id="editReason" list="editReasonsList" value="${appointment.reason || ''}" style="${inputStyle}" placeholder="${t('appointment.reasonPlaceholder', 'e.g., Regular checkup...')}">
        <datalist id="editReasonsList">
          ${settings.appointmentReasons.map(r => `<option value="${r}">`).join('')}
        </datalist>
      </div>
      ` : ''}

      <div>
        <label style="${labelStyle}">
          <span>${t('appointment.notes', 'Notes')}</span>
          ${settings.isNotesRequired ? '<span style="color:#dc3545;margin-left:4px;">*</span>' : `<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#6c757d;color:#fff;margin-left:8px;">${t('appointment.optional', 'Optional')}</span>`}
        </label>
        <textarea id="editNotes" rows="2" style="${inputStyle} resize: vertical;" placeholder="${t('appointment.notesPlaceholder', 'Additional notes...')}">${appointment.notes || ''}</textarea>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end;">
      <button id="cancelEditBtn" class="btn btn-outline-secondary btn-sm" style="padding: 6px 16px;">
        ${t('appointment.cancel', 'Cancel')}
      </button>
      <button id="saveEditBtn" class="btn btn-primary btn-sm" style="padding: 6px 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;">
        <i class="bi bi-check-circle me-1"></i>
        ${t('appointment.save', 'Save')}
      </button>
    </div>
  `;

  const overlay = document.createElement('div');
  overlay.id = 'event-popup-overlay';
  overlay.style.cssText = getOverlayCSS();

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  const closeEdit = () => {
    popup.remove();
    overlay.remove();
  };

  document.getElementById('closeEditPopup')?.addEventListener('click', closeEdit);
  document.getElementById('cancelEditBtn')?.addEventListener('click', closeEdit);
  overlay.addEventListener('click', closeEdit);

  document.getElementById('saveEditBtn')?.addEventListener('click', () => {
    const newDoctor = (document.getElementById('editDoctor') as HTMLSelectElement).value as Doctor;
    const newDate = (document.getElementById('editDate') as HTMLInputElement).value;
      const newStart = (document.getElementById('editStartTime') as HTMLSelectElement).value;
      const newEnd = (document.getElementById('editEndTime') as HTMLSelectElement).value;
      
      const editReasonInput = document.getElementById('editReason') as HTMLInputElement | null;
      const newReason = editReasonInput ? editReasonInput.value.trim() : '';
      const editNotesInput = document.getElementById('editNotes') as HTMLTextAreaElement | null;
      const newNotes = editNotesInput ? editNotesInput.value.trim() : '';
    if (!newDate || !newStart || !newEnd) return;

    appointmentRepository.update(event.id, {
      doctor: newDoctor,
      startTime: `${newDate}T${newStart}:00`,
      endTime: `${newDate}T${newEnd}:00`,
      reason: newReason,
      notes: newNotes,
    });

    closeEdit();
    refreshCalendar();

    showToast({
      type: 'success',
      message: t('messages.toast.appointmentUpdated', 'Appointment updated successfully!'),
      duration: 3000
    });

    console.info(`[AUDIT] APPOINTMENT_EDITED | ID: ${event.id} | Time: ${new Date().toISOString()}`);
  });
};
