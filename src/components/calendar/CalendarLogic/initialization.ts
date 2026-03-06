import { Calendar } from '@fullcalendar/core';
import type { EventContentArg, DateSelectArg, FormatterInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import bgLocale from '@fullcalendar/core/locales/bg';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import { getDateFormat } from '../../../utils/dateUtils';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { showAppointmentModal } from './modal';
import { showEventDetailsPopup, handleEventDrop, handleEventResize } from './eventHandlers';
import { isDuplicating, getDuplicateClipboard } from './duplicateService';
import { showDuplicatePasteModal } from './popups/duplicatePasteModal';
import { setCalendarInstance } from './types';
import i18next from '../../../i18n';
import { CALENDAR_CONFIG } from './config/constants';
import { initializeTooltip, showTooltip, hideTooltip } from './utils/tooltips';
import { setupDoctorFilters } from './utils/filters';
import { setupViewSwitcher } from './utils/viewSwitcher';
import { setupPendingBanner } from './utils/pendingBanner';
import { showUnconfirmedPanel } from './popups/unconfirmedPanel';

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
        status: appt.status
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

  // Get calendar locale based on selected language and date format settings
  const currentLanguage = i18next.language;
  const isUSFormat = getDateFormat() === 'MM/dd/yyyy';

  let calendarLocale;
  if (currentLanguage === 'bg') {
    calendarLocale = bgLocale;
  } else {
    calendarLocale = isUSFormat ? undefined : enGbLocale;
  }

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
    snapDuration: '00:15:00',
    slotLabelFormat,
    slotMinTime,
    slotMaxTime,
    businessHours,
    eventTimeFormat: slotLabelFormat,
    selectConstraint: 'businessHours',
    editable: true,
    selectable: true,
    height: 'auto',
    nowIndicator: true,
    dayMaxEvents: true,
    
    // Custom day header formatting
    dayHeaderContent: (arg: any) => {
      const dateObj = arg.date;
      const lang = i18next.language === 'bg' ? 'bg-BG' : 'en-GB';
      const dayName = new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(dateObj).toUpperCase();
      const dateNum = dateObj.getDate();
      
      const isToday = arg.isToday;
      const todayCircle = isToday 
        ? `background: var(--bs-primary); color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 10px rgba(99,102,241,0.35);` 
        : `width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: var(--text-main);`;
      
      return {
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; padding: 6px 0; gap: 4px;">
            <span style="font-size: 0.72rem; font-weight: 600; letter-spacing: 0.5px; color: ${isToday ? 'var(--bs-primary)' : 'var(--text-muted)'};">${dayName}</span>
            <span style="font-size: 1.25rem; font-weight: 700; ${todayCircle}">${dateNum}</span>
          </div>
        `
      };
    },

    events: appointmentEvents,

    // Event rendering
    eventContent: (arg: EventContentArg) => {
      const props = arg.event.extendedProps;
      const docColor = props.doctorColor || '#6366f1';
      
      const isPending = props.status === 'Pending';
      // If pending, combine the doctor's translucent color with stripes for a unified look
      const backgroundStyle = isPending 
        ? `background: repeating-linear-gradient(-45deg, ${docColor}20, ${docColor}20 5px, ${docColor}40 5px, ${docColor}40 10px);` 
        : `background-color: ${docColor}30;`;

      const reasonDisplay = props.reason ? `<div class="custom-event-reason" style="font-size: 0.72rem; opacity: 0.8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;"><i class="bi bi-chat-left-text me-1"></i>${props.reason}</div>` : '';

      return {
        html: `
          <div class="custom-calendar-event" style="border-left: 4px solid ${docColor}; ${backgroundStyle}">
            <div class="custom-event-time" style="font-size: 0.75rem; font-weight: 500; opacity: 0.8; margin-bottom: 2px;">
              ${arg.timeText}
            </div>
            <div style="font-size: 0.82rem; font-weight: 700; line-height: 1.2; display: flex; align-items: center; gap: 4px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
              <span style="overflow: hidden; text-overflow: ellipsis;">${props.patientName || 'N/A'}</span>
            </div>
            ${reasonDisplay}
          </div>
        `
      };
    },

    eventMouseEnter: showTooltip,
    eventMouseLeave: hideTooltip,
    select: (info: DateSelectArg) => {
      if (isDuplicating()) {
        const payload = getDuplicateClipboard();
        if (payload) {
          calendar.unselect();
          showDuplicatePasteModal(info.startStr, payload);
          return;
        }
      }
      console.info(`[DEBUG] Time slot selected: ${info.startStr}`);
      showAppointmentModal(info.startStr);
    },
    dateClick: (info: DateClickArg) => {
      if (isDuplicating()) {
        const payload = getDuplicateClipboard();
        if (payload) {
          showDuplicatePasteModal(info.dateStr, payload);
          return;
        }
      }
      console.info(`[DEBUG] Calendar dateClick: ${info.dateStr}`);
      showAppointmentModal(info.dateStr);
    },
    eventClick: (info) => showEventDetailsPopup(info.event),
    eventDrop: handleEventDrop,
    eventResize: handleEventResize
  });

  calendar.render();
  setCalendarInstance(calendar);

  // Setup interactive features
  setupViewSwitcher(calendar);
  const filterUpdate = setupDoctorFilters(calendar, workDays);
  filterUpdate(); // Initial apply

  // Click handler for calendar cells (fallback for clicks FullCalendar misses)
  calendarEl.addEventListener('click', (e: MouseEvent) => {
    // Skip fallback when in duplicate mode — dateClick/select handlers already cover it
    if (isDuplicating()) return;

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

  // Setup unconfirmed panel button
  const unconfirmedBtn = document.getElementById('unconfirmedPanelBtn');
  if (unconfirmedBtn) {
    // Update count badge
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const pendingCount = appointments.filter(a => a.status === 'Pending' && new Date(a.startTime) >= startOfToday).length;
    const countBadge = document.getElementById('unconfirmedCount');
    if (countBadge) {
      countBadge.textContent = String(pendingCount);
      countBadge.style.display = pendingCount > 0 ? 'inline' : 'none';
    }
    unconfirmedBtn.addEventListener('click', () => showUnconfirmedPanel());
  }
};
