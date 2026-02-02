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
import { showToast } from '../../utils/toast';
import type { Doctor } from '../../types/patient';

// Store calendar instance globally for refreshing
let calendarInstance: Calendar | null = null;

/**
 * Show event details popup when clicking on an appointment
 */
const showEventDetailsPopup = (event: any) => {
    const { patientName, phone, reason, doctor } = event.extendedProps;
    
    // Remove any existing popups
    const existingPopup = document.getElementById('event-details-popup');
    if (existingPopup) existingPopup.remove();
    
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'event-details-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        padding: 24px;
        z-index: 10000;
        min-width: 350px;
        max-width: 500px;
    `;
    
    const doctorName = doctor === 'dr-ivanov' ? 'Dr. Ivanov' : 'Dr. Ruseva';
    const startTime = event.start ? event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const endTime = event.end ? event.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <h5 style="margin: 0; color: #333; font-weight: 600;">Appointment Details</h5>
            <button id="closeEventPopup" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; line-height: 1;">×</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
                <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Patient</label>
                <div style="font-size: 16px; color: #333; font-weight: 500;">${patientName || 'N/A'}</div>
            </div>
            
            <div>
                <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Phone</label>
                <div style="font-size: 14px; color: #333;">
                    <i class="bi bi-telephone" style="margin-right: 6px;"></i>${phone || 'N/A'}
                </div>
            </div>
            
            <div>
                <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Doctor</label>
                <div style="font-size: 14px; color: #333;">${doctorName}</div>
            </div>
            
            <div>
                <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Time</label>
                <div style="font-size: 14px; color: #333;">
                    <i class="bi bi-clock" style="margin-right: 6px;"></i>${startTime} - ${endTime}
                </div>
            </div>
            
            ${reason && reason !== 'No reason specified' ? `
                <div>
                    <label style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: 500; display: block; margin-bottom: 4px;">Reason / Notes</label>
                    <div style="font-size: 14px; color: #333; padding: 8px; background: #f8f9fa; border-radius: 6px;">${reason}</div>
                </div>
            ` : ''}
        </div>
        
        <div style="margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end;">
            <button id="editEventBtn" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px;">
                <i class="bi bi-pencil"></i>
                Edit Appointment
            </button>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'event-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    // Close handlers
    const closePopup = () => {
        popup.remove();
        overlay.remove();
    };
    
    document.getElementById('closeEventPopup')?.addEventListener('click', closePopup);
    overlay.addEventListener('click', closePopup);
    
    // Edit handler (for now, just show a message - you can implement full edit later)
    document.getElementById('editEventBtn')?.addEventListener('click', () => {
        closePopup();
        showToast({
            type: 'info',
            message: 'Edit functionality coming soon! For now, delete and recreate the appointment.',
            duration: 5000
        });
    });
    
    console.info(`[DEBUG] Showing event details for appointment: ${event.id}`);
};

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
        eventDrop: (info: EventDropArg) => {
            const event = info.event;
            const doctor = event.extendedProps.doctor as Doctor;
            
            // Find doctor's working hours
            const doctorSchedule = settings.doctorSchedules.find(s => s.doctorId === doctor);
            
            if (!doctorSchedule) {
                console.warn(`[WARN] No schedule found for doctor: ${doctor}`);
                info.revert();
                showToast({
                    type: 'error',
                    message: 'Doctor schedule not found. Please check settings.',
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
                    message: 'Invalid event time. Please try again.',
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
                    message: `Cannot move appointment outside ${doctorName}'s working hours (${doctorSchedule.startTime} - ${doctorSchedule.endTime}).`,
                    duration: 10000
                });
                
                console.info(`[AUDIT] APPOINTMENT_MOVE_BLOCKED | Doctor: ${doctor} | Time: ${eventStartTime}-${eventEndTime} | Reason: Outside working hours`);
                return;
            }
            
            // Valid move - update in repository if it's a stored appointment
            if (event.id && event.id.startsWith('appointment-')) {
                const newStartISO = eventStart.toISOString();
                const newEndISO = eventEnd.toISOString();
                
                appointmentRepository.update(event.id, {
                    startTime: newStartISO,
                    endTime: newEndISO
                });
                
                console.info(`[AUDIT] APPOINTMENT_MOVED | ID: ${event.id} | New time: ${eventStartTime}-${eventEndTime}`);
                
                showToast({
                    type: 'success',
                    message: 'Appointment moved successfully!',
                    duration: 3000
                });
            }
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

/**
 * Refresh calendar settings without full page reload
 * Updates time format, slot duration, and business hours
 */
export const refreshCalendarSettings = () => {
    if (!calendarInstance) {
        console.warn('[WARN] Calendar instance not initialized, cannot refresh settings');
        return;
    }

    console.info('[DEBUG] Refreshing calendar settings...');
    
    // Load updated settings
    const settings = loadCalendarSettings();
    
    // Update slot duration
    const slotDuration = `00:${String(settings.slotDuration).padStart(2, '0')}:00`;
    calendarInstance.setOption('slotDuration', slotDuration);
    
    // Update time label format
    const slotLabelFormat = settings.timeFormat === '12h'
        ? { hour: 'numeric', minute: '2-digit', meridiem: 'short' }
        : { hour: '2-digit', minute: '2-digit', hour12: false };
    calendarInstance.setOption('slotLabelFormat', slotLabelFormat as any);
    
    // Update business hours
    const businessHours = settings.doctorSchedules.map(schedule => ({
        daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
        startTime: schedule.startTime,
        endTime: schedule.endTime,
    }));
    calendarInstance.setOption('businessHours', businessHours);
    
    console.info(`[AUDIT] CALENDAR_SETTINGS_REFRESHED | Time: ${new Date().toISOString()}`);
};
