import type { EventDropArg } from '@fullcalendar/core';
import { showToast } from '../../../utils/toast';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import { formatTime } from '../../../utils/dateUtils';
import type { Doctor } from '../../../types/patient';
import type { EventApi } from '@fullcalendar/core';
import { refreshCalendar } from './refresh';
import i18next from '../../../i18n';

/** Translation helper */
const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

/**
 * Show event details popup when clicking on an appointment
 */
export const showEventDetailsPopup = (event: EventApi) => {
  const { patientName, phone, reason, doctor } = event.extendedProps;

  // Remove any existing popups
  const existingPopup = document.getElementById('event-details-popup');
  if (existingPopup) existingPopup.remove();
  const existingOverlay = document.getElementById('event-popup-overlay');
  if (existingOverlay) existingOverlay.remove();

  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';

  // Create popup
  const popup = document.createElement('div');
  popup.id = 'event-details-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${isDark ? '#1e293b' : '#ffffff'};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,${isDark ? '0.5' : '0.18'});
    padding: 28px;
    z-index: 10000;
    min-width: 380px;
    max-width: 500px;
    border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  `;

  const doctorName = doctor === 'dr-ivanov'
    ? t('calendar.drIvanov', 'Dr. Ivanov')
    : t('calendar.drRuseva', 'Dr. Ruseva');
  const startTime = event.start ? formatTime(event.start) : 'N/A';
  const endTime = event.end ? formatTime(event.end) : 'N/A';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  const bgSubtle = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9';

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
      <h5 style="margin: 0; color: ${textColor}; font-weight: 700; font-size: 1.15rem;">
        ${t('calendar.appointmentDetails', 'Appointment Details')}
      </h5>
      <button id="closeEventPopup" style="background: none; border: none; font-size: 22px; cursor: pointer; color: ${labelColor}; padding: 0; line-height: 1; transition: color 0.15s;" onmouseover="this.style.color='${textColor}'" onmouseout="this.style.color='${labelColor}'">&times;</button>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
          ${t('calendar.patient', 'Patient')}
        </label>
        <div style="font-size: 16px; color: ${textColor}; font-weight: 600;">${patientName || 'N/A'}</div>
      </div>
      
      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
          ${t('calendar.phone', 'Phone')}
        </label>
        <div style="font-size: 14px; color: ${textColor};">
          <i class="bi bi-telephone" style="margin-right: 6px; color: ${labelColor};"></i>${phone || 'N/A'}
        </div>
      </div>
      
      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
          ${t('calendar.doctor', 'Doctor')}
        </label>
        <div style="font-size: 14px; color: ${textColor};">${doctorName}</div>
      </div>
      
      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
          ${t('calendar.time', 'Time')}
        </label>
        <div style="font-size: 14px; color: ${textColor};">
          <i class="bi bi-clock" style="margin-right: 6px; color: ${labelColor};"></i>${startTime} - ${endTime}
        </div>
      </div>
      
      ${reason && reason !== 'No reason specified' ? `
        <div>
          <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
            ${t('calendar.reasonNotes', 'Reason / Notes')}
          </label>
          <div style="font-size: 14px; color: ${textColor}; padding: 10px 12px; background: ${bgSubtle}; border-radius: 8px;">${reason}</div>
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
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    backdrop-filter: blur(2px);
  `;

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

/**
 * Show inline edit form for an existing appointment
 */
const showEditAppointmentPopup = (event: EventApi) => {
  const appointment = appointmentRepository.getById(event.id);
  if (!appointment) return;

  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#334155' : '#ffffff';
  const inputBorder = isDark ? '#475569' : '#cbd5e1';

  const popup = document.createElement('div');
  popup.id = 'event-details-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${isDark ? '#1e293b' : '#ffffff'};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,${isDark ? '0.5' : '0.18'});
    padding: 28px;
    z-index: 10000;
    min-width: 400px;
    max-width: 520px;
    border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  `;

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

  const inputStyle = `width:100%; padding: 8px 12px; border-radius: 8px; border: 1px solid ${inputBorder}; background: ${inputBg}; color: ${textColor}; font-size: 14px; outline: none;`;

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 18px;">
      <h5 style="margin: 0; color: ${textColor}; font-weight: 700; font-size: 1.15rem;">
        <i class="bi bi-pencil-square" style="margin-right: 8px; color: #6366f1;"></i>
        ${t('calendar.editAppointment', 'Edit Appointment')}
      </h5>
      <button id="closeEditPopup" style="background: none; border: none; font-size: 22px; cursor: pointer; color: ${labelColor}; padding: 0; line-height: 1;">&times;</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
          ${t('calendar.patient', 'Patient')}
        </label>
        <div style="font-size: 15px; color: ${textColor}; font-weight: 600; padding: 8px 0;">${appointment.patientName}</div>
      </div>

      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
          ${t('calendar.doctor', 'Doctor')}
        </label>
        <select id="editDoctor" style="${inputStyle}">${doctorOptions}</select>
      </div>

      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
          ${t('appointment.date', 'Date')}
        </label>
        <input type="date" id="editDate" value="${startDate}" style="${inputStyle}">
      </div>

      <div style="display: flex; gap: 12px;">
        <div style="flex: 1;">
          <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
            ${t('appointment.startTime', 'Start Time')}
          </label>
          <input type="time" id="editStartTime" value="${startTimeVal}" style="${inputStyle}">
        </div>
        <div style="flex: 1;">
          <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
            ${t('appointment.endTime', 'End Time')}
          </label>
          <input type="time" id="editEndTime" value="${endTimeVal}" style="${inputStyle}">
        </div>
      </div>

      <div>
        <label style="font-size: 11px; color: ${labelColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
          ${t('calendar.reasonNotes', 'Reason / Notes')}
        </label>
        <textarea id="editReason" rows="2" style="${inputStyle} resize: vertical;">${appointment.reason || ''}</textarea>
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
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 9999; backdrop-filter: blur(2px);
  `;

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
    const newStart = (document.getElementById('editStartTime') as HTMLInputElement).value;
    const newEnd = (document.getElementById('editEndTime') as HTMLInputElement).value;
    const newReason = (document.getElementById('editReason') as HTMLTextAreaElement).value.trim();

    if (!newDate || !newStart || !newEnd) return;

    appointmentRepository.update(event.id, {
      doctor: newDoctor,
      startTime: `${newDate}T${newStart}:00`,
      endTime: `${newDate}T${newEnd}:00`,
      reason: newReason || appointment.reason,
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

/**
 * Show a confirmation modal for moving an appointment
 */
const showMoveConfirmationModal = (onConfirm: () => void, onReject: () => void) => {
  // Remove any existing confirmation modals
  const existingModal = document.getElementById('move-confirmation-modal');
  if (existingModal) existingModal.remove();

  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'move-confirmation-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${isDark ? '#1e293b' : '#ffffff'};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,${isDark ? '0.5' : '0.18'});
    padding: 28px;
    z-index: 10001;
    min-width: 220px;
    text-align: center;
    border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  `;

  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;
  `;

  // Approve Button (Green)
  const approveBtn = document.createElement('button');
  approveBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
  approveBtn.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: #198754;
    color: white;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background 0.2s;
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
  `;
  approveBtn.onmouseover = () => { approveBtn.style.transform = 'scale(1.1)'; };
  approveBtn.onmouseout = () => { approveBtn.style.transform = 'scale(1)'; };

  // Reject Button (Red)
  const rejectBtn = document.createElement('button');
  rejectBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
  rejectBtn.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: #dc3545;
    color: white;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background 0.2s;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  `;
  rejectBtn.onmouseover = () => { rejectBtn.style.transform = 'scale(1.1)'; };
  rejectBtn.onmouseout = () => { rejectBtn.style.transform = 'scale(1)'; };

  // Add click handlers
  approveBtn.onclick = () => {
    onConfirm();
    cleanup();
  };

  rejectBtn.onclick = () => {
    onReject();
    cleanup();
  };

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'move-confirmation-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.4);
    z-index: 10000;
    backdrop-filter: blur(2px);
  `;

  // Assemble
  buttonsContainer.appendChild(approveBtn);
  buttonsContainer.appendChild(rejectBtn);

  const title = document.createElement('h5');
  title.innerText = t('calendar.confirmMove', 'Confirm Move?');
  title.style.marginBottom = '20px';
  title.style.color = isDark ? '#e2e8f0' : '#333';

  modal.appendChild(title);
  modal.appendChild(buttonsContainer);

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Cleanup function
  const cleanup = () => {
    modal.remove();
    overlay.remove();
  };

  // Close on overlay click (treat as reject)
  overlay.onclick = () => {
    onReject();
    cleanup();
  };
};


/**
 * Handle appointment drag & drop with doctor-specific validation
 */
export const handleEventDrop = (info: EventDropArg) => {
  const settings = loadCalendarSettings();
  const event = info.event;
  const doctor = event.extendedProps.doctor as Doctor;

  // Find doctor's working hours
  const doctorSchedule = settings.doctorSchedules.find(s => s.doctorId === doctor);

  if (!doctorSchedule) {
    console.warn(`[WARN] No schedule found for doctor: ${doctor}`);
    info.revert();
    showToast({
      type: 'error',
      message: t('messages.toast.doctorScheduleNotFound', 'Doctor schedule not found. Please check settings.'),
      duration: 10000
    });
    return;
  }

  // Get event start and end times
  const eventStart = event.start;
  const eventEnd = event.end;

  if (!eventStart || !eventEnd) {
    info.revert();
    showToast({
      type: 'error',
      message: t('messages.toast.invalidEventTime', 'Invalid event time. Please try again.'),
      duration: 10000
    });
    return;
  }

  // Extract time from event (HH:MM format)
  const eventStartTime = `${String(eventStart.getHours()).padStart(2, '0')}:${String(eventStart.getMinutes()).padStart(2, '0')}`;
  const eventEndTime = `${String(eventEnd.getHours()).padStart(2, '0')}:${String(eventEnd.getMinutes()).padStart(2, '0')}`;

  // Check if event is within doctor's working hours
  const isStartValid = eventStartTime >= doctorSchedule.startTime;
  const isEndValid = eventEndTime <= doctorSchedule.endTime;

  if (!isStartValid || !isEndValid) {
    // Revert the move
    info.revert();

    // Show error toast
    const doctorName = doctorSchedule.doctorName;
    showToast({
      type: 'error',
      message: t('messages.toast.outsideWorkingHours', `Cannot move appointment outside ${doctorName}'s working hours (${doctorSchedule.startTime} - ${doctorSchedule.endTime}).`, { doctorName, start: doctorSchedule.startTime, end: doctorSchedule.endTime }),
      duration: 10000
    });

    console.info(`[AUDIT] APPOINTMENT_MOVE_BLOCKED | Doctor: ${doctor} | Time: ${eventStartTime}-${eventEndTime} | Reason: Outside working hours`);
    return;
  }

  // Valid move - Ask for confirmation before updating
  if (event.id && event.id.startsWith('appointment-')) {

    // Define confirm action
    const onConfirm = () => {
      const newStartISO = eventStart.toISOString();
      const newEndISO = eventEnd.toISOString();

      appointmentRepository.update(event.id, {
        startTime: newStartISO,
        endTime: newEndISO
      });

      console.info(`[AUDIT] APPOINTMENT_MOVED | ID: ${event.id} | New time: ${eventStartTime}-${eventEndTime}`);

      showToast({
        type: 'success',
        message: t('messages.toast.appointmentMoved', 'Appointment moved successfully!'),
        duration: 3000
      });
    };

    // Define reject action
    const onReject = () => {
      info.revert();
      showToast({
        type: 'info',
        message: t('messages.toast.moveCancelled', 'Move cancelled'),
        duration: 2000
      });
    };

    // Show the confirmation
    showMoveConfirmationModal(onConfirm, onReject);
  }
};
