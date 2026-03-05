import type { EventApi } from '@fullcalendar/core';
import { showToast } from '../../../../utils/toast';
import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { refreshCalendar } from '../refresh';
import i18next from '../../../../i18n';
import { showEditAppointmentPopup } from './editPopup';
import { startDuplicate } from '../duplicateService';
import { showDeleteConfirmModal } from './deleteConfirmModal';
import { showRejectModal } from './rejectModal';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

export function wireEventDetailsActions(
  event: EventApi,
  overlay: HTMLElement,
  closePopup: () => void
): void {
  const { patientName, phone, reason, doctor } = event.extendedProps;

  document.getElementById('closeEventPopup')?.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  document.getElementById('deleteEventBtn')?.addEventListener('click', () => {
    showDeleteConfirmModal(patientName || 'N/A', () => {
      appointmentRepository.delete(event.id);
      closePopup();
      refreshCalendar();
      showToast({
        type: 'success',
        message: t('messages.toast.appointmentDeleted', 'Appointment deleted successfully!'),
        duration: 3000
      });
    });
  });

  document.getElementById('editEventBtn')?.addEventListener('click', () => {
    closePopup();
    showEditAppointmentPopup(event);
  });

  document.getElementById('rejectEventBtn')?.addEventListener('click', () => {
    showRejectModal(patientName || 'N/A', (reason: string) => {
      appointmentRepository.update(event.id, { status: 'Rejected', rejectionReason: reason });
      closePopup();
      refreshCalendar();
      showToast({
        type: 'warning',
        message: t('calendar.appointmentRejected', 'Appointment rejected'),
        duration: 3000
      });
      console.info(`[AUDIT] APPOINTMENT_REJECTED | ID: ${event.id} | Reason: ${reason} | Time: ${new Date().toISOString()}`);
    });
  });

  document.getElementById('confirmEventBtn')?.addEventListener('click', () => {
    appointmentRepository.update(event.id, { status: 'Confirmed', confirmedAt: new Date().toISOString() });
    closePopup();
    refreshCalendar();
    showToast({
      type: 'success',
      message: t('calendar.appointmentConfirmed', 'Appointment confirmed!'),
      duration: 3000
    });
    console.info(`[AUDIT] APPOINTMENT_CONFIRMED | ID: ${event.id} | Time: ${new Date().toISOString()}`);
  });

  document.getElementById('duplicateEventBtn')?.addEventListener('click', () => {
    const durationMs = (event.end && event.start)
      ? event.end.getTime() - event.start.getTime()
      : 30 * 60 * 1000;

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
}
