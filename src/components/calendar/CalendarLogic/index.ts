/**
 * CalendarLogic - Modular calendar management
 * 
 * Exports:
 * - initCalendar: Initialize FullCalendar instance with settings
 * - refreshCalendar: Refresh calendar events from repository
 * - refreshCalendarSettings: Update calendar settings without page reload
 * - showEventDetailsPopup: Display appointment details in a popup
 */


export { initCalendar } from './initialization';
export { refreshCalendar, refreshCalendarSettings, refreshCalendarLocale } from './refresh';
export { showEventDetailsPopup } from './eventHandlers';
export { showAppointmentModal } from './modal';
