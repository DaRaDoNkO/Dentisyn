import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import { getCalendarInstance } from './types';
import { CALENDAR_CONFIG } from './config/constants';
import bgLocale from '@fullcalendar/core/locales/bg';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import i18next from '../../../i18n';
import { getDateFormat } from '../../../utils/dateUtils';

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

  // Get appointments from repository
  const appointments = appointmentRepository.getAll();

  // Convert stored appointments to calendar events (match initCalendar format)
  const appointmentEvents = appointments.map(appt => {
    const doctorColor = CALENDAR_CONFIG.DOCTOR_COLORS[appt.doctor as keyof typeof CALENDAR_CONFIG.DOCTOR_COLORS] || '#999999';
    return {
      id: appt.id,
      title: `${appt.reason} - ${appt.patientName}`,
      start: appt.startTime,
      end: appt.endTime,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      extendedProps: {
        doctorColor,
        doctor: appt.doctor,
        patientName: appt.patientName,
        patientId: appt.patientId,
        phone: appt.phone,
        reason: appt.reason,
        notes: appt.notes,
        status: appt.status,
      }
    };
  });

  // Remove all events and add new ones
  calendarInstance.removeAllEvents();
  calendarInstance.addEventSource(appointmentEvents);

  // Update unconfirmed badge count
  updateUnconfirmedBadge(appointments);

  console.info(`[DEBUG] Calendar refreshed with ${appointmentEvents.length} events from storage`);
};

/**
 * Refresh calendar locale when language changes
 */
export const refreshCalendarLocale = () => {
  const calendarInstance = getCalendarInstance();
  
  if (!calendarInstance) {
    console.warn('[WARNING] Cannot refresh calendar locale - instance not available');
    return;
  }

  const currentLanguage = i18next.language;
  const isUSFormat = getDateFormat() === 'MM/dd/yyyy';

  let calendarLocale;
  if (currentLanguage === 'bg') {
    calendarLocale = bgLocale;
  } else {
    calendarLocale = isUSFormat ? undefined : enGbLocale;
  }

  // Update locale dynamically
  calendarInstance.setOption('locale', calendarLocale);
  
  console.info(`[DEBUG] Calendar locale updated to: ${currentLanguage}`);
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

/**
 * Update the unconfirmed appointments badge count in the calendar header
 */
const updateUnconfirmedBadge = (appointments?: ReturnType<typeof appointmentRepository.getAll>): void => {
  const countBadge = document.getElementById('unconfirmedCount');
  if (!countBadge) return;

  const allAppts = appointments ?? appointmentRepository.getAll();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const pendingCount = allAppts.filter(
    a => a.status === 'Pending' && new Date(a.startTime) >= startOfToday
  ).length;

  countBadge.textContent = String(pendingCount);
  countBadge.style.display = pendingCount > 0 ? 'inline' : 'none';
};
