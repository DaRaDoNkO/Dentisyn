import type { Doctor } from '../../../../types/patient';
import { getTestDoctors } from '../../../../utils/localhostData';

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
  slotDuration: 30,
  doctorSchedules: loadDefaultDoctorSchedules(),
};
