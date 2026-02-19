import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import bgLocale from '@fullcalendar/core/locales/bg';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/index';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { showAppointmentModal } from './modal';
import { showEventDetailsPopup, handleEventDrop } from './eventHandlers';
import { setCalendarInstance } from './types';
import i18next from '../../../i18n';

/**
 * Initialize the FullCalendar instance
 */
export const initCalendar = () => {
  const calendarEl = document.getElementById('calendar') as HTMLElement;
  if (!calendarEl) return;

  // Load user settings from localStorage
  const settings = loadCalendarSettings();
  console.info('[DEBUG] Loaded calendar settings:', settings);

  // Determine slot duration based on settings
  const slotDuration = `00:${String(settings.slotDuration).padStart(2, '0')}:00`;

  // Determine time label format based on settings
  const slotLabelFormat = settings.timeFormat === '12h'
    ? { hour: 'numeric', minute: '2-digit', meridiem: 'short' }
    : { hour: '2-digit', minute: '2-digit', hour12: false };

  // Doctor Colors
  const COLOR_IVANOV = '#198754'; // Green
  const COLOR_RUSEVA = '#0d6efd'; // Blue

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
    extendedProps: {
      doctor: appt.doctor,
      patientName: appt.patientName,
      patientId: appt.patientId,
      phone: appt.phone,
      reason: appt.reason
    }
  }));

  const events = appointmentEvents;

  // Build business hours from doctor schedules
  const businessHours = settings.doctorSchedules.map(schedule => ({
    daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  }));

  // Create Tooltip Element if it doesn't exist
  let tooltip = document.getElementById('calendar-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'calendar-tooltip';
    document.body.appendChild(tooltip);
  }

  let tooltipTimeout: any;

  // Get current language for FullCalendar locale
  const currentLanguage = i18next.language;
  const calendarLocale = currentLanguage === 'bg' ? bgLocale : undefined;

  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    locale: calendarLocale,
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    buttonText: {
      today: i18next.t('calendar.today'),
      month: i18next.t('calendar.month'),
      week: i18next.t('calendar.week'),
      day: i18next.t('calendar.day'),
      list: i18next.t('calendar.list')
    },
    slotDuration: slotDuration,
    slotLabelFormat: slotLabelFormat as any,
    businessHours: businessHours,
    selectConstraint: 'businessHours',
    editable: true,
    selectable: true,
    height: 'auto',
    events: events,

    // CUSTOM EVENT RENDERING: Name/Reason First, then Time
    eventContent: (arg) => {
      const props = arg.event.extendedProps;
      const patientName = props.patientName || 'Patient';
      const reason = props.reason || '';

      // Construct title: "Ivanov - Checkup"
      const displayTitle = reason ? `${patientName} - ${reason}` : arg.event.title;
      const timeText = arg.timeText;

      let html = `
        <div class="fc-event-main-frame">
          <div class="fc-event-title-container">
            <div class="fc-event-title fc-sticky" style="font-weight: 700;">${displayTitle}</div>
          </div>
          <div class="fc-event-time" style="font-size: 0.85em;">${timeText}</div>
        </div>
      `;

      return { html: html };
    },

    eventMouseEnter: (info) => {
      // Clear any existing timeout to avoid overlapping
      if (tooltipTimeout) clearTimeout(tooltipTimeout);

      // Set timeout for 1.5 seconds (1500ms)
      tooltipTimeout = setTimeout(() => {
        if (!tooltip) return;

        const event = info.event;
        const doctor = event.extendedProps.doctor === 'dr-ivanov' ? 'Dr. Ivanov' : 'Dr. Ruseva';
        const reason = event.extendedProps.reason || event.title;
        const time = `${event.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        tooltip.innerHTML = `
          <h6>${event.extendedProps.patientName || 'Patient'}</h6>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Doctor:</strong> ${doctor}</p>
          <p class="mt-1 text-primary"><i class="bi bi-clock"></i> ${time}</p>
        `;

        // Position Logic - Offset by 20px
        const rect = info.el.getBoundingClientRect();

        // Simple positioning to the right of the event, or below if too close to edge
        let top = rect.top;
        let left = rect.right + 10;

        // Check window bounds
        if (left + 300 > window.innerWidth) {
          left = rect.left - 310; // Show on left if no space on right
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.classList.add('visible');

      }, 500);
    },

    eventMouseLeave: () => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      if (tooltip) tooltip.classList.remove('visible');
    },

    select: (info) => {
      console.info(`[DEBUG] Time slot selected: ${info.startStr}`);
      showAppointmentModal(info.startStr);
    },
    dateClick: (info) => {
      console.info(`[DEBUG] Calendar dateClick: ${info.dateStr}`);
      showAppointmentModal(info.dateStr);
    },
    eventClick: (info) => {
      showEventDetailsPopup(info.event);
    },
    eventDrop: handleEventDrop
  });

  calendar.render();

  setCalendarInstance(calendar);

  // --- Wire up Custom Connectors ---

  // View Switchers
  const viewButtons = ['timeGridWeek', 'dayGridMonth', 'listWeek'];
  viewButtons.forEach(viewName => {
    const btn = document.getElementById(`view-${viewName}`);
    if (btn) {
      btn.addEventListener('click', () => {
        calendar.changeView(viewName);
        viewButtons.forEach(v => document.getElementById(`view-${v}`)?.classList.remove('active'));
        btn.classList.add('active');
      });
    }
  });

  // Doctor Filters
  const filterIvanov = document.getElementById('filterIvanov') as HTMLInputElement;
  const filterRuseva = document.getElementById('filterRuseva') as HTMLInputElement;

  const filterEvents = () => {
    const showIvanov = filterIvanov?.checked ?? true;
    const showRuseva = filterRuseva?.checked ?? true;

    // Filter events
    const allEvents = calendar.getEvents();
    allEvents.forEach(event => {
      const doctor = event.extendedProps.doctor;

      // Default hidden
      let shouldShow = false;

      if (doctor === 'dr-ivanov' && showIvanov) shouldShow = true;
      else if (doctor === 'dr-ruseva' && showRuseva) shouldShow = true;
      // Keep other events visible if they don't have doctor prop? Assuming strict filtering here:
      else if (!doctor) shouldShow = true;

      if (shouldShow) {
        event.setProp('display', 'auto');
      } else {
        event.setProp('display', 'none');
      }
    });

    // Update business hours based on selected doctors
    const activeDoctorSchedules = settings.doctorSchedules.filter(schedule => {
      if (schedule.doctorId === 'dr-ivanov' && showIvanov) return true;
      if (schedule.doctorId === 'dr-ruseva' && showRuseva) return true;
      return false;
    });

    if (activeDoctorSchedules.length === 0) {
      // No doctors selected - show all hours as non-business (gray everything)
      calendar.setOption('businessHours', []);
      console.info('[DEBUG] No doctors selected - all hours grayed out');
    } else {
      // Build business hours from active doctors only
      const filteredBusinessHours = activeDoctorSchedules.map(schedule => ({
        daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      }));

      calendar.setOption('businessHours', filteredBusinessHours);
      console.info(`[DEBUG] Updated business hours for ${activeDoctorSchedules.length} doctor(s)`);
    }
  };

  filterIvanov?.addEventListener('change', filterEvents);
  filterRuseva?.addEventListener('change', filterEvents);

  // Initial Filter Apply
  filterEvents();

  // Add fallback click handler for calendar cells
  const calendarCellClickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Check if clicked on time grid slot or day grid cell
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
  };

  // Attach fallback handler with event delegation
  calendarEl.addEventListener('click', calendarCellClickHandler, true);
};
