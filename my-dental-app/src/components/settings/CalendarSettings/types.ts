import type { Doctor } from '../../../types/patient';

export interface CalendarSettings {
  timeFormat: '24h' | '12h';
  slotDuration: 15 | 30 | 60;
  doctorSchedules: DoctorSchedule[];
}

export interface DoctorSchedule {
  doctorId: Doctor;
  doctorName: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export const SETTINGS_KEY = 'dentisyn-calendar-settings';

// Default settings
export const defaultSettings: CalendarSettings = {
  timeFormat: '24h',
  slotDuration: 30,
  doctorSchedules: [
    { doctorId: 'dr-ivanov', doctorName: 'Dr. Ivanov', startTime: '08:00', endTime: '18:00' },
    { doctorId: 'dr-ruseva', doctorName: 'Dr. Ruseva', startTime: '09:00', endTime: '17:00' },
  ],
};
