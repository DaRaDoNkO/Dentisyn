import { Calendar } from '@fullcalendar/core';
import type { EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { renderAppointmentModal, initAppointmentModal } from '../appointment/AppointmentModal';
import { appointmentRepository } from '../../repositories/appointmentRepository';
import { loadCalendarSettings } from '../settings/CalendarSettings/index';

// Store calendar instance globally for refreshing
let calendarInstance: Calendar | null = null;

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
        extendedProps: { doctor: appt.doctor, patientName: appt.patientName }
    }));

    const events = [...mockEvents, ...appointmentEvents];

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
        eventDrop: (info: EventDropArg) => {
            const eventTitle = info.event.title;
            
            // Show confirm dialog
            const confirmed = confirm(`Move "${eventTitle}" to new time?`);
            
            if (!confirmed) {
                // User rejected - revert the change
                info.revert();
            }
            // If confirmed, keep the new dates (no need to do anything)
        }
    });

    calendar.render();
    
    // Store calendar instance for refreshing
    calendarInstance = calendar;

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

/**
 * Refresh calendar events from repository
 */
export const refreshCalendar = () => {
    if (!calendarInstance) {
        console.warn('[WARNING] Cannot refresh calendar - instance not available');
        return;
    }
    
    console.info(`[DEBUG] Refreshing calendar with new appointments`);
    
    const COLOR_IVANOV = '#198754';
    const COLOR_RUSEVA = '#0d6efd';
    
    // Get appointments from repository
    const appointments = appointmentRepository.getAll();
    
    // Mock events
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
        extendedProps: { doctor: appt.doctor, patientName: appt.patientName }
    }));
    
    const allEvents = [...mockEvents, ...appointmentEvents];
    
    // Remove all events and add new ones
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(allEvents);
    
    console.info(`[DEBUG] Calendar refreshed with ${allEvents.length} events (${mockEvents.length} mock + ${appointmentEvents.length} stored)`);
};

/**
 * Show appointment modal for creating a new appointment
 */
const showAppointmentModal = (clickedDateISO: string) => {
    console.info(`[DEBUG] showAppointmentModal called with: ${clickedDateISO}`);
    
    // Create or find modal container at body level for proper z-index stacking
    let modalContainer = document.getElementById('appointmentModalContainer');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'appointmentModalContainer';
        document.body.appendChild(modalContainer);
        console.info(`[DEBUG] Created new modal container at body level`);
    }

    console.info(`[DEBUG] Modal container found/created, clearing previous content`);
    
    // Clear previous modal content to avoid duplicates
    modalContainer.innerHTML = '';
    
    // Render modal HTML
    modalContainer.innerHTML = renderAppointmentModal(clickedDateISO);

    // Initialize modal event handlers with callback to refresh calendar
    initAppointmentModal(() => {
        console.info(`[DEBUG] Appointment saved, refreshing calendar`);
        refreshCalendar();
    });
    
    // Apply i18n translations to modal content
    if ((window as any).i18next) {
        setTimeout(() => {
            const elements = modalContainer.querySelectorAll('[data-i18n]');
            elements.forEach((element) => {
                const key = element.getAttribute('data-i18n');
                if (key) {
                    element.textContent = (window as any).i18next.t(key);
                }
            });
        }, 10);
    }

    // Show the modal using setTimeout to ensure DOM is updated
    setTimeout(() => {
        const appointmentModal = document.getElementById('appointmentModal');
        if (!appointmentModal) {
            console.error('[ERROR] appointmentModal element not found after rendering');
            alert('Failed to create modal. Please try again.');
            return;
        }
        
        console.info(`[DEBUG] Found appointmentModal element, attempting to show`);
        
        // Use the globally available Bootstrap from window
        const Bootstrap = (window as any).bootstrap;
        if (!Bootstrap || !Bootstrap.Modal) {
            console.error('[ERROR] Bootstrap.Modal not available', {
                windowBootstrap: (window as any).bootstrap,
                hasModal: (window as any).bootstrap?.Modal
            });
            alert('Bootstrap not loaded properly. Please refresh the page.');
            return;
        }
        
        try {
            const bsModal = new Bootstrap.Modal(appointmentModal, { backdrop: true, keyboard: true });
            console.info(`[DEBUG] Bootstrap modal created successfully, showing now`);
            bsModal.show();
        } catch (error) {
            console.error('[ERROR] Failed to initialize Bootstrap modal:', error);
            alert('Failed to show modal. Check console for details.');
        }
    }, 100);
};
