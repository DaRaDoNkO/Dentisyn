import type { EventResizeDoneArg } from '@fullcalendar/interaction';
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
 * Handle appointment resize (duration change) with doctor-specific validation
 */
export const handleEventResize = (info: EventResizeDoneArg) => {
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

  // Extract time (HH:MM format)
  const eventEndTime = `${String(eventEnd.getHours()).padStart(2, '0')}:${String(eventEnd.getMinutes()).padStart(2, '0')}`;

  // Check if new end time is within doctor's working hours
  if (eventEndTime > doctorSchedule.endTime) {
    info.revert();
    const doctorName = doctorSchedule.doctorName;
    showToast({
      type: 'error',
      message: t('messages.toast.outsideWorkingHours', `Cannot extend appointment outside ${doctorName}'s working hours (${doctorSchedule.startTime} - ${doctorSchedule.endTime}).`, { doctorName, start: doctorSchedule.startTime, end: doctorSchedule.endTime }),
      duration: 10000
    });
    console.info(`[AUDIT] APPOINTMENT_RESIZE_BLOCKED | Doctor: ${doctor} | New end: ${eventEndTime} | Reason: Outside working hours`);
    return;
  }

  // Valid resize — ask for confirmation
  if (event.id) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const startTime = `${String(eventStart.getHours()).padStart(2, '0')}:${String(eventStart.getMinutes()).padStart(2, '0')}`;

    const onConfirm = () => {
      appointmentRepository.update(event.id, {
        startTime: formatLocal(eventStart),
        endTime: formatLocal(eventEnd)
      });

      refreshCalendar();

      console.info(`[AUDIT] APPOINTMENT_RESIZED | ID: ${event.id} | New time: ${startTime}-${eventEndTime}`);

      showToast({
        type: 'success',
        message: t('messages.toast.appointmentResized', 'Appointment duration updated successfully!'),
        duration: 3000
      });
    };

    const onReject = () => {
      info.revert();
      showToast({
        type: 'info',
        message: t('messages.toast.resizeCancelled', 'Duration change cancelled'),
        duration: 2000
      });
    };

    showMoveConfirmationModal(onConfirm, onReject, t('calendar.confirmResize', 'Confirm Duration Change?'));
  }
};
