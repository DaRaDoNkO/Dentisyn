import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import { getCalendarInstance } from './types';

/**
 * Refresh calendar events from repository
 */
export const refreshCalendar = () => {
  const calendarInstance = getCalendarInstance();

  if (!calendarInstance) {
    console.warn('[WARNING] Cannot refresh calendar - instance not available');
    return;
  }

  console.info(`[DEBUG] Refreshing calendar with new appointments`);

  const COLOR_IVANOV = '#198754';
  const COLOR_RUSEVA = '#0d6efd';

  // Get appointments from repository
  const appointments = appointmentRepository.getAll();

  // Convert stored appointments to calendar events
  const appointmentEvents = appointments.map(appt => ({
    id: appt.id,
    title: `${appt.reason} - ${appt.patientName}`,
    start: appt.startTime,
    end: appt.endTime,
    backgroundColor: appt.doctor === 'dr-ivanov' ? COLOR_IVANOV : COLOR_RUSEVA,
    borderColor: appt.doctor === 'dr-ivanov' ? COLOR_IVANOV : COLOR_RUSEVA,
    extendedProps: { doctor: appt.doctor, patientName: appt.patientName }
  }));

  const allEvents = appointmentEvents;

  // Remove all events and add new ones
  calendarInstance.removeAllEvents();
  calendarInstance.addEventSource(allEvents);

  console.info(`[DEBUG] Calendar refreshed with ${allEvents.length} events from storage`);
};

/**
 * Refresh calendar settings without full page reload
 * Updates time format, slot duration, and business hours
 */
export const refreshCalendarSettings = () => {
  const calendarInstance = getCalendarInstance();

  if (!calendarInstance) {
    console.warn('[WARN] Calendar instance not initialized, cannot refresh settings');
    return;
  }

  console.info('[DEBUG] Refreshing calendar settings...');

  const settings = loadCalendarSettings();

  // Update slot duration
  const slotDuration = `00:${String(settings.slotDuration).padStart(2, '0')}:00`;
  calendarInstance.setOption('slotDuration', slotDuration);

  // Update time format
  const slotLabelFormat = settings.timeFormat === '12h'
    ? { hour: 'numeric', minute: '2-digit', meridiem: 'short' }
    : { hour: '2-digit', minute: '2-digit', hour12: false };
  calendarInstance.setOption('slotLabelFormat', slotLabelFormat as any);

  // Update business hours
  const businessHours = settings.doctorSchedules.map(schedule => ({
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  }));
  calendarInstance.setOption('businessHours', businessHours);

  console.info('[DEBUG] Calendar settings refreshed successfully');
};
