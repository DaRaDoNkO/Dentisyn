import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { loadCalendarSettings } from '../../settings/CalendarSettings/index';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { showAppointmentModal } from './modal';
import { showEventDetailsPopup, handleEventDrop } from './eventHandlers';
import { setCalendarInstance } from './types';

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
  const mockEvents = [
    { 
      id: '1', 
      title: 'Consultation - Ivanov', 
      start: `${new Date().toISOString().split('T')[0]}T10:00:00`, 
      end: `${new Date().toISOString().split('T')[0]}T10:30:00`, 
      backgroundColor: COLOR_IVANOV, 
      borderColor: COLOR_IVANOV,
      extendedProps: { doctor: 'dr-ivanov' } 
    },
    { 
      id: '2', 
      title: 'Root Canal - Ruseva', 
      start: `${new Date().toISOString().split('T')[0]}T14:00:00`, 
      end: `${new Date().toISOString().split('T')[0]}T15:30:00`, 
      backgroundColor: COLOR_RUSEVA, 
      borderColor: COLOR_RUSEVA,
      extendedProps: { doctor: 'dr-ruseva' } 
    },
    { 
      id: '3', 
      title: 'Checkup - Ivanov', 
      start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T09:00:00',
      end: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T09:15:00',
      backgroundColor: COLOR_IVANOV,
      borderColor: COLOR_IVANOV,
      extendedProps: { doctor: 'dr-ivanov' } 
    }
  ];

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

  const events = [...mockEvents, ...appointmentEvents];

  // Build business hours from doctor schedules
  const businessHours = settings.doctorSchedules.map(schedule => ({
    daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  }));

  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '' // we controlled this with custom buttons
    },
    buttonText: {
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      list: 'List'
    },
    slotDuration: slotDuration, // Apply from settings
    slotLabelFormat: slotLabelFormat as any, // Apply from settings
    businessHours: businessHours, // Gray out non-working hours
    selectConstraint: 'businessHours', // Prevent selecting outside business hours
    // Remove global eventConstraint - we'll validate per-doctor in eventDrop
    editable: true,
    selectable: true,
    height: 'auto',
    events: events,
    select: (info) => {
      // Handle time slot selection
      console.info(`[DEBUG] Time slot selected: ${info.startStr}`);
      showAppointmentModal(info.startStr);
    },
    dateClick: (info) => {
      // Show appointment modal when clicking on a time slot
      console.info(`[DEBUG] Calendar dateClick: ${info.dateStr}`);
      showAppointmentModal(info.dateStr);
    },
    eventClick: (info) => {
      // Show event details popup
      showEventDetailsPopup(info.event);
    },
    eventDrop: handleEventDrop
  });

  calendar.render();
  
  // Store calendar instance for refreshing
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
