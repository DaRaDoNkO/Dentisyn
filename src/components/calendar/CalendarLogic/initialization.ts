import { Calendar } from '@fullcalendar/core';
import type { EventContentArg, DateSelectArg, FormatterInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import bgLocale from '@fullcalendar/core/locales/bg';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { showAppointmentModal } from './modal';
import { showEventDetailsPopup, handleEventDrop } from './eventHandlers';
import { setCalendarInstance } from './types';
import i18next from '../../../i18n';
import { CALENDAR_CONFIG } from './config/constants';
import { initializeTooltip, showTooltip, hideTooltip } from './utils/tooltips';
import { setupDoctorFilters } from './utils/filters';
import { setupViewSwitcher } from './utils/viewSwitcher';
import { setupPendingBanner } from './utils/pendingBanner';

/**
 * Initialize the FullCalendar instance with all settings and event handlers
 */
export const initCalendar = () => {
  const calendarEl = document.getElementById('calendar') as HTMLElement;
  if (!calendarEl) return;

  const settings = loadCalendarSettings();
  // Defensive: ensure critical arrays are never undefined
  if (!Array.isArray(settings.hiddenDays)) settings.hiddenDays = [0, 6];
  if (!Array.isArray(settings.doctorSchedules)) settings.doctorSchedules = [];
  console.info('[DEBUG] Loaded calendar settings:', settings);

  // Calculate slot duration
  const slotDuration = `00:${String(settings.slotDuration).padStart(2, '0')}:00`;

  // Time format based on settings
  const slotLabelFormat: FormatterInput = settings.timeFormat === '12h'
    ? { hour: 'numeric', minute: '2-digit', meridiem: 'short' }
    : { hour: '2-digit', minute: '2-digit', hour12: false };

  // Get visible time range from doctor schedules
  const allStartHours = settings.doctorSchedules.map(s => parseInt(s.startTime.split(':')[0], 10));
  const allEndHours = settings.doctorSchedules.map(s => parseInt(s.endTime.split(':')[0], 10));
  const earliestHour = Math.max(0, Math.min(...allStartHours) - CALENDAR_CONFIG.TIME_SLOTS.HOUR_PADDING);
  const latestHour = Math.min(24, Math.max(...allEndHours) + CALENDAR_CONFIG.TIME_SLOTS.HOUR_PADDING);
  const slotMinTime = `${String(earliestHour).padStart(2, '0')}:00:00`;
  const slotMaxTime = `${String(latestHour).padStart(2, '0')}:00:00`;

  // Build appointment events with doctor colors
  const appointments = appointmentRepository.getAll();
  const appointmentEvents = appointments.map(appt => {
    const doctorColor = CALENDAR_CONFIG.DOCTOR_COLORS[appt.doctor as keyof typeof CALENDAR_CONFIG.DOCTOR_COLORS] || '#999999';
    return {
      id: appt.id,
      title: `${appt.reason} - ${appt.patientName}`,
      start: appt.startTime,
      end: appt.endTime,
      backgroundColor: doctorColor,
      borderColor: doctorColor,
      extendedProps: {
        doctor: appt.doctor,
        patientName: appt.patientName,
        patientId: appt.patientId,
        phone: appt.phone,
        reason: appt.reason
      }
    };
  });

  // Build business hours
  const workDays = [0, 1, 2, 3, 4, 5, 6].filter(d => !settings.hiddenDays.includes(d));
  const businessHours = settings.doctorSchedules.map(schedule => ({
    daysOfWeek: workDays,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  }));

  // Initialize tooltip
  initializeTooltip();

  // Get calendar locale
  const currentLanguage = i18next.language;
  const calendarLocale = currentLanguage === 'bg' ? bgLocale : undefined;

  // Create calendar with all configuration
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    locale: calendarLocale,
    firstDay: settings.weekStartDay,
    hiddenDays: settings.hiddenDays,
    initialView: 'timeGridWeek',
    headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
    buttonText: {
      today: i18next.t('calendar.today'),
      month: i18next.t('calendar.month'),
      week: i18next.t('calendar.week'),
      day: i18next.t('calendar.day'),
      list: i18next.t('calendar.list')
    },
    slotDuration,
    slotLabelFormat,
    slotMinTime,
    slotMaxTime,
    businessHours,
    selectConstraint: 'businessHours',
    editable: true,
    selectable: true,
    height: 'auto',
    nowIndicator: true,
    dayMaxEvents: true,
    events: appointmentEvents,

    // Event rendering
    eventContent: (arg: EventContentArg) => {
      const props = arg.event.extendedProps;
      const displayTitle = props.reason
        ? `${props.patientName} - ${props.reason}`
        : arg.event.title;
      
      return {
        html: `
          <div class="fc-event-main-frame">
            <div class="fc-event-title-container">
              <div class="fc-event-title fc-sticky" style="font-weight: 700;">${displayTitle}</div>
            </div>
            <div class="fc-event-time" style="font-size: 0.85em;">${arg.timeText}</div>
          </div>
        `
      };
    },

    eventMouseEnter: showTooltip,
    eventMouseLeave: hideTooltip,
    select: (info: DateSelectArg) => {
      console.info(`[DEBUG] Time slot selected: ${info.startStr}`);
      showAppointmentModal(info.startStr);
    },
    dateClick: (info: DateClickArg) => {
      console.info(`[DEBUG] Calendar dateClick: ${info.dateStr}`);
      showAppointmentModal(info.dateStr);
    },
    eventClick: (info) => showEventDetailsPopup(info.event),
    eventDrop: handleEventDrop
  });

  calendar.render();
  setCalendarInstance(calendar);

  // Setup interactive features
  setupViewSwitcher(calendar);
  const filterUpdate = setupDoctorFilters(calendar, workDays);
  filterUpdate(); // Initial apply

  // Click handler for calendar cells
  calendarEl.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.fc-timegrid-slot') || target.closest('.fc-daygrid-day') || target.closest('.fc-col-time-frame')) {
      const cellElement = target.closest('[data-time]') || target.closest('[data-date]') || target.closest('.fc-daygrid-day');
      if (cellElement) {
        const dateAttr = cellElement.getAttribute('data-date');
        if (dateAttr) {
          console.info(`[DEBUG] Fallback handler: clicked on cell with date: ${dateAttr}`);
          showAppointmentModal(dateAttr);
        }
      }
    }
  }, true);

  // Setup pending appointment banner
  setupPendingBanner(calendarEl, filterUpdate);
};
