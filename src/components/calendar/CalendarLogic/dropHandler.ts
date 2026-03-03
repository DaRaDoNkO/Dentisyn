import type { EventDropArg } from '@fullcalendar/core';
import type { Doctor } from '../../../types/patient';
import { showToast } from '../../../utils/toast';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import { refreshCalendar } from './refresh';
import { showMoveConfirmationModal } from './popups/confirmMoveModal';
import i18next from '../../../i18n';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

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
  if (event.id) {

    // Define confirm action
    const onConfirm = () => {
      // Format as local datetime (consistent with how appointments are stored)
      const pad = (n: number) => String(n).padStart(2, '0');
      const formatLocal = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

      const newStart = formatLocal(eventStart);
      const newEnd = formatLocal(eventEnd);

      appointmentRepository.update(event.id, {
        startTime: newStart,
        endTime: newEnd
      });

      refreshCalendar();

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
