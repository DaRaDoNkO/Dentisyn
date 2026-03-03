import type { Doctor } from '../../../../types/patient';
import type { DateFormatPattern } from '../../../../utils/dateUtils';
import { getTestDoctors } from '../../../../utils/localhostData';

export interface CalendarSettings {
  timeFormat: '24h' | '12h';
  dateFormat: DateFormatPattern;
  slotDuration: 15 | 30 | 60;
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  hiddenDays: number[]; // e.g. [0, 6] for Sunday & Saturday
  doctorSchedules: DoctorSchedule[];
}

export interface DoctorSchedule {
  doctorId: Doctor;
  doctorName: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export const SETTINGS_KEY = 'dentisyn-calendar-settings';

// Load default doctor schedules from localhost test data
const loadDefaultDoctorSchedules = (): DoctorSchedule[] => {
  const testDoctors = getTestDoctors();
  return testDoctors.map(doctor => ({
    doctorId: doctor.id as Doctor,
    doctorName: doctor.name,
    startTime: doctor.startTime,
    endTime: doctor.endTime,
  }));
};

// Default settings
export const defaultSettings: CalendarSettings = {
  timeFormat: '24h',
  dateFormat: 'dd.MM.yyyy',
  slotDuration: 30,
  weekStartDay: 1, // Monday default
  hiddenDays: [0, 6], // Hide Saturday & Sunday by default
  doctorSchedules: loadDefaultDoctorSchedules(),
};
