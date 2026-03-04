/**
 * Duplicate Paste Modal
 *
 * Shown when the user clicks a time slot while in duplicate mode.
 * Pre-fills patient info, allows changing doctor and entering new notes,
 * then creates the appointment.
 */

import type { Doctor } from '../../../../types/patient';
import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { loadCalendarSettings } from '../../../user/Settings/CalendarSettings/index';
import { refreshCalendar } from '../refresh';
import { showToast } from '../../../../utils/toast';
import {
  getThemeColors,
  getPopupCSS,
  getOverlayCSS,
  getLabelCSS,
  getTitleCSS,
  getHeaderCSS,
  getCloseButtonCSS,
  getFieldContainerCSS,
  getInputCSS,
} from '../../../../utils/popupStyles';
import i18next from '../../../../i18n';
import type { DuplicatePayload } from '../duplicateService';
import { consumeDuplicate } from '../duplicateService';

const t = (key: string, fb: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fb, ...opts }) as string;

/**
 * Open a modal that lets the user confirm the duplicated appointment,
 * change the doctor, and enter new notes.
 *
 * @param clickedDateISO  The ISO date string of the clicked slot (e.g. "2026-03-09" or "2026-03-09T10:00:00")
 * @param payload         The clipboard data (patient, doctor, duration…)
 */
export const showDuplicatePasteModal = (
  clickedDateISO: string,
  payload: DuplicatePayload
): void => {
  // Prevent double-open (e.g. from both dateClick and fallback handler)
  if (document.getElementById('duplicate-paste-popup')) return;

  const colors = getThemeColors();
  const inputStyle = getInputCSS(colors);
  const labelStyle = `${getLabelCSS()} color: ${colors.labelColor};`;

  // Parse clicked date/time
  const clicked = new Date(clickedDateISO);
  const dateStr = clickedDateISO.split('T')[0] ||
    `${clicked.getFullYear()}-${String(clicked.getMonth() + 1).padStart(2, '0')}-${String(clicked.getDate()).padStart(2, '0')}`;

  const pad = (n: number) => String(n).padStart(2, '0');

  const startHour = pad(clicked.getHours());
  const startMin  = pad(clicked.getMinutes());
  const startTimeVal = `${startHour}:${startMin}`;

  // Compute default end time from original duration
  const endDate = new Date(clicked.getTime() + payload.durationMs);
  const endTimeVal = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

  // Doctor options
  const settings = loadCalendarSettings();
  const doctorOptions = settings.doctorSchedules.map(s => {
    const name = s.doctorId === 'dr-ivanov'
      ? t('calendar.drIvanov', 'Dr. Ivanov')
      : t('calendar.drRuseva', 'Dr. Ruseva');
    const sel = payload.doctor === s.doctorId ? 'selected' : '';
    return `<option value="${s.doctorId}" ${sel}>${name}</option>`;
  }).join('');

  // Build popup
  const popup = document.createElement('div');
  popup.id = 'duplicate-paste-popup';
  popup.style.cssText = getPopupCSS(colors) + '; min-width: 420px; max-width: 520px;';

  popup.innerHTML = `
    <div style="${getHeaderCSS()}">
      <h5 style="${getTitleCSS(colors)}">
        <i class="bi bi-clipboard-plus" style="margin-right: 8px; color: #6366f1;"></i>
        ${t('calendar.duplicateAppointment', 'Duplicate Appointment')}
      </h5>
      <button id="closeDuplicatePopup" style="${getCloseButtonCSS(colors)}">&times;</button>
    </div>

    <div style="${getFieldContainerCSS()}">
      <!-- Patient (read-only) -->
      <div>
        <label style="${labelStyle}">${t('calendar.patient', 'Patient')}</label>
        <div style="font-size: 15px; color: ${colors.textColor}; font-weight: 600; padding: 8px 0;">
          <i class="bi bi-person" style="margin-right: 6px; color: ${colors.labelColor};"></i>${payload.patientName}
        </div>
      </div>

      <!-- Phone (read-only) -->
      <div>
        <label style="${labelStyle}">${t('calendar.phone', 'Phone')}</label>
        <div style="font-size: 14px; color: ${colors.textColor}; padding: 4px 0;">
          <i class="bi bi-telephone" style="margin-right: 6px; color: ${colors.labelColor};"></i>${payload.phone || 'N/A'}
        </div>
      </div>

      <!-- Doctor (editable) -->
      <div>
        <label style="${labelStyle}">${t('calendar.doctor', 'Doctor')}</label>
        <select id="dupDoctor" style="${inputStyle}">${doctorOptions}</select>
      </div>

      <!-- Date (read-only display) -->
      <div>
        <label style="${labelStyle}">${t('appointment.date', 'Date')}</label>
        <div style="font-size: 14px; color: ${colors.textColor}; padding: 4px 0;">
          <i class="bi bi-calendar3" style="margin-right: 6px; color: ${colors.labelColor};"></i>${dateStr}
        </div>
      </div>

      <!-- Time (read-only display) -->
      <div>
        <label style="${labelStyle}">${t('calendar.time', 'Time')}</label>
        <div style="font-size: 14px; color: ${colors.textColor}; padding: 4px 0;">
          <i class="bi bi-clock" style="margin-right: 6px; color: ${colors.labelColor};"></i>${startTimeVal} – ${endTimeVal}
        </div>
      </div>

      <!-- New Notes (required) -->
      <div>
        <label style="${labelStyle}">${t('calendar.newNotes', 'Notes for this visit')}</label>
        <textarea id="dupReason" rows="3" placeholder="${t('messages.placeholder.enterNotes', 'Enter notes or reason for visit...')}"
          style="${inputStyle} resize: vertical;">${payload.reason || ''}</textarea>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end;">
      <button id="cancelDupBtn" class="btn btn-outline-secondary btn-sm" style="padding: 6px 16px;">
        ${t('appointment.cancel', 'Cancel')}
      </button>
      <button id="saveDupBtn" class="btn btn-primary btn-sm" style="padding: 6px 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;">
        <i class="bi bi-clipboard-check me-1"></i>
        ${t('calendar.duplicateSave', 'Create Appointment')}
      </button>
    </div>
  `;

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'duplicate-paste-overlay';
  overlay.style.cssText = getOverlayCSS();

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // ── Handlers ─────────────────────────────────────────────────
  const closeModal = (cancelled: boolean) => {
    popup.remove();
    overlay.remove();
    if (cancelled) {
      // Put clipboard data back? No — user explicitly cancelled, consume it.
      consumeDuplicate();
    }
  };

  document.getElementById('closeDuplicatePopup')?.addEventListener('click', () => closeModal(true));
  document.getElementById('cancelDupBtn')?.addEventListener('click', () => closeModal(true));
  overlay.addEventListener('click', () => closeModal(true));

  document.getElementById('saveDupBtn')?.addEventListener('click', () => {
    const doctor = (document.getElementById('dupDoctor') as HTMLSelectElement).value as Doctor;
    const reason = (document.getElementById('dupReason') as HTMLTextAreaElement).value.trim() || 'No reason specified';

    const startDateTime = `${dateStr}T${startTimeVal}:00`;
    const endDateTime   = `${dateStr}T${endTimeVal}:00`;

    // Consume the clipboard
    consumeDuplicate();

    // Create the new appointment
    const newAppt = appointmentRepository.create({
      patientId: payload.patientId,
      patientName: payload.patientName,
      phone: payload.phone,
      doctor,
      startTime: startDateTime,
      endTime: endDateTime,
      reason,
      status: 'Pending',
    });

    popup.remove();
    overlay.remove();
    refreshCalendar();

    showToast({
      type: 'success',
      message: t('messages.toast.appointmentDuplicated', 'Appointment duplicated successfully!'),
      duration: 3000
    });

    console.info(
      `[AUDIT] APPOINTMENT_DUPLICATED | ID: ${newAppt.id} | Patient: ${payload.patientName} | Time: ${new Date().toISOString()}`
    );
  });
};
