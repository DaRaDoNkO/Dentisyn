/**
 * Doctor availability utilities for appointment modal
 */

import type { Doctor } from '../../types/patient';
import { loadCalendarSettings } from '../user/Settings/CalendarSettings/index';

/**
 * Filter available doctors based on selected time slot
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Array of available doctor objects with id and name
 */
export function getAvailableDoctors(startTime: string, endTime: string): Array<{ id: Doctor, name: string }> {
  const settings = loadCalendarSettings();
  const availableDoctors: Array<{ id: Doctor, name: string }> = [];

  settings.doctorSchedules.forEach(schedule => {
    const isStartValid = startTime >= schedule.startTime;
    const isEndValid = endTime <= schedule.endTime;

    if (isStartValid && isEndValid) {
      availableDoctors.push({
        id: schedule.doctorId,
        name: schedule.doctorName
      });
    }
  });

  return availableDoctors;
}
