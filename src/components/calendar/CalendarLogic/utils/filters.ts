/**
 * Doctor filter logic
 */

import type { Calendar } from '@fullcalendar/core';
import { loadCalendarSettings } from '../../../user/Settings/CalendarSettings/index';

export const setupDoctorFilters = (calendar: Calendar, workDays: number[]): (() => void) => {
  const filterIvanov = document.getElementById('filterIvanov') as HTMLInputElement;
  const filterRuseva = document.getElementById('filterRuseva') as HTMLInputElement;

  const filterEvents = () => {
    const settings = loadCalendarSettings();
    const showIvanov = filterIvanov?.checked ?? true;
    const showRuseva = filterRuseva?.checked ?? true;

    // Filter events by doctor
    const allEvents = calendar.getEvents();
    allEvents.forEach(event => {
      const doctor = event.extendedProps.doctor;
      let shouldShow = false;

      if (doctor === 'dr-ivanov' && showIvanov) shouldShow = true;
      else if (doctor === 'dr-ruseva' && showRuseva) shouldShow = true;
      else if (!doctor) shouldShow = true;

      event.setProp('display', shouldShow ? 'auto' : 'none');
    });

    // Update business hours based on selected doctors
    const activeDoctorSchedules = settings.doctorSchedules.filter(schedule => {
      if (schedule.doctorId === 'dr-ivanov' && showIvanov) return true;
      if (schedule.doctorId === 'dr-ruseva' && showRuseva) return true;
      return false;
    });

    if (activeDoctorSchedules.length === 0) {
      calendar.setOption('businessHours', []);
      console.info('[DEBUG] No doctors selected - all hours grayed out');
    } else {
      const filteredBusinessHours = activeDoctorSchedules.map(schedule => ({
        daysOfWeek: workDays,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      }));

      calendar.setOption('businessHours', filteredBusinessHours);
      console.info(`[DEBUG] Updated business hours for ${activeDoctorSchedules.length} doctor(s)`);
    }
  };

  filterIvanov?.addEventListener('change', filterEvents);
  filterRuseva?.addEventListener('change', filterEvents);

  return filterEvents;
};
