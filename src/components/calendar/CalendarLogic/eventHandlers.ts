import type { EventDropArg } from '@fullcalendar/core';
import { showToast } from '../../../utils/toast';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import type { Doctor } from '../../../types/patient';

/**
 * Show event details popup when clicking on an appointment
 */
export const showEventDetailsPopup = (event: any) => {
  const { patientName, phone, reason, doctor } = event.extendedProps;

  // Remove any existing popups
  const existingPopup = document.getElementById('event-details-popup');
  if (existingPopup) existingPopup.remove();

  // Create popup
  const popup = document.createElement('div');
  popup.id = 'event-details-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    padding: 24px;
    z-index: 10000;
    min-width: 350px;
    max-width: 500px;
  `;

  const doctorName = doctor === 'dr-ivanov' ? 'Dr. Ivanov' : 'Dr. Ruseva';
  const startTime = event.start ? event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const endTime = event.end ? event.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
      <h5 style="margin: 0; color: #333; font-weight: 600;">Appointment Details</h5>
      <button id="closeEventPopup" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; line-height: 1;">×</button>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Patient</label>
        <div style="font-size: 16px; color: #333; font-weight: 500;">${patientName || 'N/A'}</div>
      </div>
      
      <div>
        <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Phone</label>
        <div style="font-size: 14px; color: #333;">
          <i class="bi bi-telephone" style="margin-right: 6px;"></i>${phone || 'N/A'}
        </div>
      </div>
      
      <div>
        <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Doctor</label>
        <div style="font-size: 14px; color: #333;">${doctorName}</div>
      </div>
      
      <div>
        <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Time</label>
        <div style="font-size: 14px; color: #333;">
          <i class="bi bi-clock" style="margin-right: 6px;"></i>${startTime} - ${endTime}
        </div>
      </div>
      
      ${reason && reason !== 'No reason specified' ? `
        <div>
          <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Reason / Notes</label>
          <div style="font-size: 14px; color: #333; padding: 8px; background: #f8f9fa; border-radius: 6px;">${reason}</div>
        </div>
      ` : ''}
    </div>
    
    <div style="margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end;">
      <button id="editEventBtn" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px;">
        <i class="bi bi-pencil"></i>
        Edit Appointment
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

  // Edit handler (for now, just show a message - you can implement full edit later)
  document.getElementById('editEventBtn')?.addEventListener('click', () => {
    closePopup();
    showToast({
      type: 'info',
      message: 'Edit functionality coming soon! For now, delete and recreate the appointment.',
      duration: 5000
    });
  });

  console.info(`[DEBUG] Showing event details for appointment: ${event.id}`);
};

/**
 * Show a confirmation modal for moving an appointment
 */
const showMoveConfirmationModal = (onConfirm: () => void, onReject: () => void) => {
  // Remove any existing confirmation modals
  const existingModal = document.getElementById('move-confirmation-modal');
  if (existingModal) existingModal.remove();

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'move-confirmation-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    padding: 24px;
    z-index: 10001;
    min-width: 200px;
    text-align: center;
    border: 1px solid rgba(0,0,0,0.1);
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
  title.innerText = 'Confirm Move?';
  title.style.marginBottom = '20px';
  title.style.color = '#333';

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
      message: 'Doctor schedule not found. Please check settings.',
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
      message: 'Invalid event time. Please try again.',
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
      message: `Cannot move appointment outside ${doctorName}'s working hours (${doctorSchedule.startTime} - ${doctorSchedule.endTime}).`,
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
        message: 'Appointment moved successfully!',
        duration: 3000
      });
    };

    // Define reject action
    const onReject = () => {
      info.revert();
      showToast({
        type: 'info',
        message: 'Move cancelled',
        duration: 2000
      });
    };

    // Show the confirmation
    showMoveConfirmationModal(onConfirm, onReject);
  }
};
